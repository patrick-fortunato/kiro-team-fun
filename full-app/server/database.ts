import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'translator.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
}

function initializeSchema(): void {
  const database = db;

  database.exec(`
    CREATE TABLE IF NOT EXISTS personas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      definition TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS analysis_history (
      id TEXT PRIMARY KEY,
      original_text TEXT NOT NULL,
      mode TEXT NOT NULL,
      tone_score INTEGER NOT NULL,
      tone_label TEXT NOT NULL,
      honest_interpretation TEXT,
      risk_misinterpretation TEXT,
      risk_defensiveness TEXT,
      risk_escalation TEXT,
      persona_id TEXT REFERENCES personas(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS detected_patterns (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL REFERENCES analysis_history(id) ON DELETE CASCADE,
      phrase TEXT NOT NULL,
      start_index INTEGER NOT NULL,
      end_index INTEGER NOT NULL,
      category TEXT NOT NULL,
      explanation TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rewrites (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL REFERENCES analysis_history(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      estimated_tone_score INTEGER,
      persona_id TEXT REFERENCES personas(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS preferences (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed default preferences if not exist
  const prefExists = database.prepare('SELECT key FROM preferences WHERE key = ?').get('history_enabled');
  if (!prefExists) {
    database.prepare('INSERT INTO preferences (key, value) VALUES (?, ?)').run('history_enabled', 'false');
  }
}

export function closeDb(): void {
  if (db) {
    db.close();
  }
}
