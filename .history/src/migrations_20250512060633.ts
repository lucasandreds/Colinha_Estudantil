import Database from 'better-sqlite3';
import fs from 'node:fs/promises';
import path from 'node:path';
import { cwd } from 'node:process';

// Ensure the 'db' directory exists
await fs.mkdir(path.join(cwd(), 'db'), { recursive: true });

// Open the SQLite database
const db = new Database('db/sqlite');

// Set PRAGMA settings
db.pragma('journal_mode = WAL');

// Read the SQL file content
const sqlFilePath = path.join(cwd(), 'queries', 'create_users_table.sql');
const sql = await fs.readFile(sqlFilePath, 'utf8');

// Execute SQL (could be multiple statements)
db.exec(sql);


async function migrate() {
    const version = db.pragma('user_version', { simple: true });
    switch(version) {
        case 0:
            db.exec(await fs.readFile(path.join(cwd(), 'queries', 'create_files_table.sql'), 'utf-8'));
            db.pragma('user_version = 39400698');
            return migrate();
        case 39400698:
            db.exec(await fs.readFile(path.join(cwd(), 'queries', 'create_exercises_table.sql'), 'utf-8'));
            db.exec(await fs.readFile(path.join(cwd(), 'queries', 'create_files_table.sql'), 'utf-8'));
            db.exec('CREATE INDEX IF NOT EXISTS idx_exercises_owner_id ON exercises (owner_id)');
            db.pragma('user_version = 61077540');
            return migrate();
        case 98198766:
            db.exec(await fs.readFile(path.join(cwd(), 'queries', 'create_files_table.sql'), 'utf-8'));
            db.pragma('user_version = 61077540');
            return migrate();
        case 61077540:
            db.exec(await fs.readFile(path.join(cwd(), 'queries', 'create_notes_table.sql'), 'utf-8'));
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

export const insertFile = db.prepare('INSERT INTO files (original_name, stored_name, username) VALUES (:original_name, :stored_name, :username)')
export const deleteFile = db.prepare('DELETE FROM files WHERE id = ?')
export const getSingleFile = db.prepare('SELECT * FROM files WHERE id = ?')
export const getAllFiles = db.prepare('SELECT * FROM files WHERE username = ? ORDER BY uploaded_at DESC');

export const getSingleNote = db.prepare('SELECT * FROM notes WHERE id = ?');
export const getAllNotes = db.prepare('SELECT * FROM notes WHERE username = ? ORDER BY created_at DESC');
export const insertNote = db.prepare('INSERT INTO notes (title, content, username) VALUES (:title, :content, :username)');
export const updateNote = db.prepare('UPDATE notes SET title = :title, content = :content, updated_at = :updated_at WHERE id = :id');
export const deleteNote = db.prepare('DELETE FROM notes WHERE id = ?');