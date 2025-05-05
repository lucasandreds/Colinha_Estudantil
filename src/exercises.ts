import { WithUser } from './index.js';
import {
    getSingleExercise,
    getAllExercises,
    insertExercise,
    upsertExercise,
    delteExercise
} from './migrations.js';

export interface ExerciseQuestionAnswer {
    text: string,
    value: number,
}

export interface ExerciseQuestion {
    title: string,
    answers: ExerciseQuestionAnswer[],
};

export interface ExerciseData {
    rowid: number,
    owner_id: string,
    name: string,
    description: string,
    questions: ExerciseQuestion[],
};

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
    static parse(exercise: any) {
        if(!exercise) throw new Error('Exercise not found');
        if(!(typeof exercise === 'object' && 'rowid' in exercise && 'owner_id' in exercise && 'name' in exercise && 'description' in exercise && 'data' in exercise))
            throw new Error('Invalid exercise data');
        if(typeof exercise.rowid !== 'number' || typeof exercise.owner_id !== 'string' || typeof exercise.name !== 'string' || typeof exercise.description !== 'string' || typeof exercise.data !== 'string')
            throw new Error('Invalid exercise data');
        const data = JSON.parse(exercise.data);
        for(const question of data) {
            if(typeof question.title !== 'string' || !Array.isArray(question.answers))
                throw new Error('Invalid exercise question data');
            for(const answer of question.answers)
                if(typeof answer.text !== 'string' || typeof answer.value !== 'number')
                    throw new Error('Invalid exercise answer data');
        }
        return new Exercise({
            rowid: exercise.rowid,
            owner_id: exercise.owner_id,
            name: exercise.name,
            description: exercise.description,
            questions: data,
        });
    }
    static get(id: string) {
        const exercise = getSingleExercise.get(id);
        return Exercise.parse(exercise);
    }
    static getAll(owner_id: string): Exercise[] {
        const exercises = getAllExercises.all(owner_id);
        return exercises.map((exercise) => Exercise.parse(exercise));
    }
    static create(data: Omit<ExerciseData, 'rowid'>): Exercise {
        const { owner_id, name, description, questions } = data;
        const r = insertExercise.run({ owner_id, name, description, data: JSON.stringify(questions) });
        const id = r.lastInsertRowid;
        if(typeof id === 'bigint') throw new Error('Too many exercises');
        return new Exercise(Object.assign({}, data, { rowid: id }));
    }
    update(data?: Partial<Omit<ExerciseData, 'rowid'>>) {
        if(data) {
            if(data.name) this.name = data.name;
            if(data.description) this.description = data.description;
            if(data.questions) this.questions = data.questions;
        }
        upsertExercise.run({
            rowid: this.rowid,
            owner_id: this.owner_id,
            name: this.name,
            description: this.description,
            data: JSON.stringify(this.questions),
        });
    }
    delete() {
        delteExercise.run(this.rowid);
    }
    parseResult(body: any) {
        if(!('exercise_id' in body && 'owner_id' in body && 'username' in body)) {
            throw new Error('Invalid exercise answer body');
        }
        const { exercise_id, owner_id, username, ...answers } = body;
        return this.questions.map((question, index) => {
            const selectedValue = answers[`question_${index}`];
            const correctAnswer = question.answers.reduce((max, ans) =>
                ans.value > max.value ? ans : max
            );
            const isCorrect = selectedValue == correctAnswer.value;
            const isPartial = selectedValue < correctAnswer.value && selectedValue > 0;
            const percent = selectedValue / correctAnswer.value;
    
            return {
                title: question.title,
                selectedText: question.answers.find(ans => ans.value == selectedValue)?.text || 'N/A',
                correctText: correctAnswer.text,
                isCorrect,
                isPartial,
                percent,
            };
        });
    }
};

export function parseExerciseFromRequest(req: WithUser<any>): Omit<ExerciseData, 'rowid'> {
    const { exName, exDesc, exQuestion } = req.body;
    if(!exName || !exDesc || !exQuestion) {
        throw new Error('Missing required fields: exName, exDesc, or exQuestions');
    }
    if(!Array.isArray(exQuestion) || exQuestion.length === 0) {
        throw new Error('exQuestion must be a non-empty array');
    }
    const questions: ExerciseData['questions'] = [];
    for(const q of exQuestion) {
        if(!q.title || !Array.isArray(q.answers) || q.answers.length === 0)
            throw new Error('Invalid question data');
        console.info(q);
        for(const a of q.answers) {
            if(!a.text || isNaN(+a.value))
                throw new Error('Invalid answer data');
            a.value = +a.value;
        }
        questions.push({ title: q.title, answers: q.answers });
    }
    return {
        owner_id: req.user?.username,
        name: exName,
        description: exDesc,
        questions: questions,
    };
}