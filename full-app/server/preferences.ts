import { getDb } from './database';

export function getPreference(key: string): string | null {
  const db = getDb();
  const row = db.prepare('SELECT value FROM preferences WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setPreference(key: string, value: string): void {
  const db = getDb();
  const exists = db.prepare('SELECT key FROM preferences WHERE key = ?').get(key);
  if (exists) {
    db.prepare('UPDATE preferences SET value = ? WHERE key = ?').run(value, key);
  } else {
    db.prepare('INSERT INTO preferences (key, value) VALUES (?, ?)').run(key, value);
  }
}

export function getAllPreferences(): Record<string, string> {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM preferences').all() as { key: string; value: string }[];
  const prefs: Record<string, string> = {};
  for (const row of rows) {
    prefs[row.key] = row.value;
  }
  return prefs;
}
