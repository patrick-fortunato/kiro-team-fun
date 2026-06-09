import { v4 as uuidv4 } from 'uuid';
import { getDb } from './database';

export interface Persona {
  id: string;
  name: string;
  definition: string;
  is_default: number;
  created_at: string;
  updated_at: string;
}

export function getAllPersonas(): Persona[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM personas ORDER BY is_default DESC, name ASC'
  ).all() as Persona[];
}

export function getPersonaById(id?: string): Persona {
  const db = getDb();
  if (id) {
    const persona = db.prepare('SELECT * FROM personas WHERE id = ?').get(id) as Persona | undefined;
    if (persona) return persona;
  }
  // Return default
  return db.prepare('SELECT * FROM personas WHERE is_default = 1').get() as Persona;
}

export function createPersona(name: string, definition: string): Persona {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO personas (id, name, definition, is_default, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)'
  ).run(id, name, definition, now, now);

  return db.prepare('SELECT * FROM personas WHERE id = ?').get(id) as Persona;
}

export function updatePersona(id: string, name: string, definition: string): Persona | null {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM personas WHERE id = ?').get(id) as Persona | undefined;
  if (!existing) return null;

  const now = new Date().toISOString();
  db.prepare(
    'UPDATE personas SET name = ?, definition = ?, updated_at = ? WHERE id = ?'
  ).run(name, definition, now, id);

  return db.prepare('SELECT * FROM personas WHERE id = ?').get(id) as Persona;
}

export function deletePersona(id: string): { success: boolean; error?: string } {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM personas WHERE id = ?').get(id) as Persona | undefined;
  if (!existing) return { success: false, error: 'Persona not found' };
  if (existing.is_default) return { success: false, error: 'Cannot delete the default persona' };

  db.prepare('DELETE FROM personas WHERE id = ?').run(id);
  return { success: true };
}

export function importPersona(name: string, definition: string): Persona {
  return createPersona(name, definition);
}
