import Database from 'better-sqlite3';
import fs from 'node:fs/promises'
import path from 'node:path';
import { cwd, exit } from 'node:process';

await fs.mkdir(path.join(cwd(), 'db'), { recursive: true });
const db = new Database('db/sqlite');
db.pragma('journal_mode = WAL');

async function migrate() {
    const version = db.pragma('user_version', { simple: true });
    switch(version) {
        case 0:
            db.exec(await fs.readFile(path.join(cwd(), 'queries', 'create_files_table.sql'), 'utf-8'));
            db.pragma('user_version = 39400698');
            return migrate();
        case 39400698:
            db.exec(await fs.readFile(path.join(cwd(), 'queries', 'create_exercises_table.sql'), 'utf-8'));
            db.exec('CREATE INDEX IF NOT EXISTS idx_exercises_owner_id ON exercises (owner_id)');
            db.pragma('user_version = 61077540');
            return migrate();
        case 98198766:
            db.exec(await fs.readFile(path.join(cwd(), 'queries', 'create_files_table.sql'), 'utf-8'));
            db.pragma('user_version = 61077540');
            return migrate();
        case 61077540:
            return;
        default:
            console.error('A versão do banco de dados não é conhecida:', version);
            exit(1);
    }
}

db.exec('BEGIN');
await migrate();
db.exec('COMMIT');

export const upsertExercise = db.prepare('INSERT OR REPLACE INTO exercises (rowid, owner_id, name, description, data) VALUES (:rowid, :owner_id, :name, :description, :data)');
export const insertExercise = db.prepare('INSERT INTO exercises (owner_id, name, description, data) VALUES (:owner_id, :name, :description, :data)');
export const updateExercise = db.prepare('UPDATE exercises SET name = :name, description = :description, data = :data WHERE rowid = :rowid');
export const getSingleExercise = db.prepare('SELECT rowid, * FROM exercises WHERE rowid = ?');
export const getAllExercises = db.prepare('SELECT rowid, * FROM exercises WHERE owner_id = ?');
export const delteExercise = db.prepare('DELETE FROM exercises WHERE rowid = ?');

export default db;