import Database from 'better-sqlite3';
import fs from 'node:fs/promises'
import path from 'node:path';
import { cwd, exit } from 'node:process';

await fs.mkdir(path.join(cwd(), 'db'), { recursive: true });
const db = new Database('db/sqlite');
db.pragma('journal_mode = WAL');

const version = db.pragma('user_version', { simple: true });

function migrate() {
    while(1) switch(version) {
        case 0:
            db.exec('DROP TABLE IF EXISTS files');
            db.exec(`
                CREATE TABLE files (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    original_name TEXT NOT NULL,
                    stored_name TEXT NOT NULL,
                    username TEXT NOT NULL,
                    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);
            db.pragma('user_version = 39400698');
            return;
            // Aqui entra uma migração. Ao fim da migração, atualizar a versão:
            // db.pragma('user_version = 39400698');
            // Usar um número aleatório para evitar conflitos entre branches
            // Assim, as migrações formam uma árvore e todas as branches convergem
            // A versão final retorna a função, as outras dão continue
        case 39400698:
            return; 
        default:
            console.error('A versão do banco de dados não é conhecida:', version);
            exit(1);
    }
}

db.exec('BEGIN');
migrate();
db.exec('COMMIT');

export default db;

