import Database from "better-sqlite3";

// Abre o banco de dados que está na pasta "db/"
const db = new Database("db/colinha.sqlite");

// Opcional: cria a tabela se ainda não existir (evita erro no primeiro uso)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
`);

export default db;
