import { withUser } from './autenticacao.js';
import type { Request } from 'express';
import {
    getSingleExercise,
    getAllExercises,
    insertExercise,
    upsertExercise,
    delteExercise
} from './migrations.js';

/**
 * Extend Express Request to include the user property added by withUser middleware
 */
export interface RequestWithUser extends Request {
    user?: {
        username: string;
        // add other user properties if needed
    };
}

export interface ExerciseQuestionAnswer {
    text: string;
    value: number;
}

export interface ExerciseQuestion {
    title: string;
    answers: ExerciseQuestionAnswer[];
}

export interface ExerciseData {
    rowid: number;
    owner_id: string;
    name: string;
    description: string;
    questions: ExerciseQuestion[];
}

export class Exercise {
    rowid: number;
    owner_id: string;
    name: string;
    description: string;
    questions: ExerciseQuestion[];

    constructor(exercise: ExerciseData) {
        this.rowid = exercise.rowid;
        this.owner_id = exercise.owner_id;
        this.name = exercise.name;
        this.description = exercise.description;
        this.questions = exercise.questions;
    }

    static parse(raw: any): Exercise {
        if (!raw) throw new Error('Exercise not found');
        const requiredProps = ['rowid', 'owner_id', 'name', 'description', 'data'];
        for (const prop of requiredProps) {
            if (!(prop in raw)) {
                throw new Error(`Invalid exercise data: missing ${prop}`);
            }
        }
        if (typeof raw.rowid !== 'number' || typeof raw.owner_id !== 'string' ||
            typeof raw.name !== 'string' || typeof raw.description !== 'string' ||
            typeof raw.data !== 'string') {
            throw new Error('Invalid exercise data types');
        }

        const data: ExerciseQuestion[] = JSON.parse(raw.data);
        data.forEach((question, qi) => {
            if (typeof question.title !== 'string' || !Array.isArray(question.answers)) {
                throw new Error(`Invalid question data at index ${qi}`);
            }
            question.answers.forEach((answer, ai) => {
                if (typeof answer.text !== 'string' || typeof answer.value !== 'number') {
                    throw new Error(`Invalid answer data at question ${qi}, answer ${ai}`);
                }
            });
        });

        return new Exercise({
            rowid: raw.rowid,
            owner_id: raw.owner_id,
            name: raw.name,
            description: raw.description,
            questions: data
        });
    }

    static get(id: string): Exercise {
        const raw = getSingleExercise.get(id);
        return Exercise.parse(raw);
    }

    static getAll(owner_id: string): Exercise[] {
        const raws = getAllExercises.all(owner_id);
        return raws.map(raw => Exercise.parse(raw));
    }

    static create(data: Omit<ExerciseData, 'rowid'>): Exercise {
        const { owner_id, name, description, questions } = data;
        const result = insertExercise.run({ owner_id, name, description, data: JSON.stringify(questions) });
        const id = result.lastInsertRowid;
        if (typeof id === 'bigint') throw new Error('Too many exercises');

        return new Exercise({ ...data, rowid: Number(id) });
    }

    update(fields?: Partial<Omit<ExerciseData, 'rowid'>>): void {
        if (fields) {
            if (fields.name) this.name = fields.name;
            if (fields.description) this.description = fields.description;
            if (fields.questions) this.questions = fields.questions;
        }
        upsertExercise.run({
            rowid: this.rowid,
            owner_id: this.owner_id,
            name: this.name,
            description: this.description,
            data: JSON.stringify(this.questions)
        });
    }

    delete(): void {
        delteExercise.run(this.rowid);
    }

    parseResult(body: any) {
        const required = ['exercise_id', 'owner_id', 'username'];
        for (const r of required) {
            if (!(r in body)) {
                throw new Error(`Invalid result body: missing ${r}`);
            }
        }
        const { exercise_id, owner_id, username, ...answers } = body;

        return this.questions.map((question, index) => {
            const selectedValue = answers[`question_${index}`];
            const correctAnswer = question.answers.reduce((max, ans) => ans.value > max.value ? ans : max);
            const isCorrect = selectedValue === correctAnswer.value;
            const isPartial = selectedValue < correctAnswer.value && selectedValue > 0;
            const percent = selectedValue / correctAnswer.value;

            return {
                title: question.title,
                selectedText: question.answers.find(ans => ans.value === selectedValue)?.text || 'N/A',
                correctText: correctAnswer.text,
                isCorrect,
                isPartial,
                percent
            };
        });
    }
}

/**
 * Safely parse exercise data from request body.
 * Assumes withUser middleware has added `user` to `req`.
 */
export function parseExerciseFromRequest(
    req: RequestWithUser
): Omit<ExerciseData, 'rowid'> {
    const { exName, exDesc, exQuestion } = req.body;
    if (!exName || !exDesc || !exQuestion) {
        throw new Error('Missing required fields: exName, exDesc, or exQuestion');
    }
    if (!Array.isArray(exQuestion) || exQuestion.length === 0) {
        throw new Error('exQuestion must be a non-empty array');
    }

    const questions: ExerciseQuestion[] = exQuestion.map((q: any, qi: number) => {
        if (!q.title || !Array.isArray(q.answers) || q.answers.length === 0) {
            throw new Error(`Invalid question at index ${qi}`);
        }
        const answers = q.answers.map((a: any, ai: number) => {
            if (!a.text || isNaN(+a.value)) {
                throw new Error(`Invalid answer at question ${qi}, answer ${ai}`);
            }
            return { text: a.text, value: +a.value };
        });
        return { title: q.title, answers };
    });

    return {
        owner_id: req.user?.username ?? 'unknown',
        name: exName,
        description: exDesc,
        questions
    };
}