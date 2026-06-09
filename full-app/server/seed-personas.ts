import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from './database';

const DEFAULT_PERSONA = {
  id: 'default-professional',
  name: 'AI-Professional',
  definition: 'You are a professional communication coach. Rewrite messages to be clear, respectful, and direct. Maintain a neutral, business-appropriate tone. Preserve all factual content, deadlines, and action items.',
  is_default: 1,
};

export function seedPersonas(): void {
  const db = getDb();

  // Seed default AI-Professional persona if not exists
  const defaultExists = db.prepare('SELECT id FROM personas WHERE id = ?').get(DEFAULT_PERSONA.id);
  if (!defaultExists) {
    db.prepare(
      'INSERT INTO personas (id, name, definition, is_default) VALUES (?, ?, ?, ?)'
    ).run(DEFAULT_PERSONA.id, DEFAULT_PERSONA.name, DEFAULT_PERSONA.definition, DEFAULT_PERSONA.is_default);
    console.log('✅ Seeded default AI-Professional persona');
  }

  // Auto-import from data/seed-personas/*.json
  const seedDir = path.join(process.cwd(), '..', 'data', 'seed-personas');
  if (!fs.existsSync(seedDir)) {
    // Also check relative to workspace root
    const altSeedDir = path.join(process.cwd(), 'data', 'seed-personas');
    if (fs.existsSync(altSeedDir)) {
      importFromDirectory(altSeedDir, db);
    } else {
      console.log('ℹ️  No seed-personas directory found, skipping auto-import');
    }
    return;
  }
  importFromDirectory(seedDir, db);
}

function importFromDirectory(seedDir: string, db: ReturnType<typeof getDb>): void {
  const files = fs.readdirSync(seedDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    try {
      const filePath = path.join(seedDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const name = content.name;
      const definition = content.persona_definition;

      if (!name || !definition) {
        console.warn(`⚠️  Skipping ${file}: missing name or persona_definition`);
        continue;
      }

      // Check if persona already exists by name
      const existing = db.prepare('SELECT id FROM personas WHERE name = ?').get(name);
      if (existing) {
        continue; // Already imported
      }

      const id = name.toLowerCase().replace(/\s+/g, '-');
      db.prepare(
        'INSERT INTO personas (id, name, definition, is_default) VALUES (?, ?, ?, 0)'
      ).run(id, name, definition);
      console.log(`✅ Imported persona: ${name}`);
    } catch (err: any) {
      console.warn(`⚠️  Failed to import ${file}: ${err.message}`);
    }
  }
}
