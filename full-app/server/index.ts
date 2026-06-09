import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { getDb } from './database';
import { seedPersonas } from './seed-personas';
import { getAllPersonas, getPersonaById, createPersona, updatePersona, deletePersona } from './personas';
import { mockAnalyzeText } from './mock-analyze';
import { saveAnalysis, deleteAllHistory } from './history';
import { getPreference, setPreference, getAllPreferences } from './preferences';

// Toggle: set USE_REAL_AI=true in .env to use real OpenAI API
const USE_REAL_AI = process.env.USE_REAL_AI === 'true';

const app = express();
const PORT = 3001;
const upload = multer({ limits: { fileSize: 500 * 1024 } }); // 500KB max

app.use(cors());
app.use(express.json());

// Initialize database and seed personas on startup
getDb();
seedPersonas();

// ==================== Analysis Endpoint ====================

app.post('/api/analyze', async (req, res) => {
  try {
    const { text, mode, personaId } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }
    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text must be 5000 characters or fewer' });
    }

    const validModes = ['analyze', 'decode', 'ramp_up', 'cool_down', 'nuclear'];
    if (!mode || !validModes.includes(mode)) {
      return res.status(400).json({ error: `Mode must be one of: ${validModes.join(', ')}` });
    }

    let result;
    if (USE_REAL_AI) {
      const { analyzeText } = await import('./analyze');
      result = await analyzeText(text, mode, personaId);
    } else {
      result = await mockAnalyzeText(text, mode, personaId);
    }

    // Save to history if enabled (don't crash if save fails)
    try {
      saveAnalysis(text, mode, result, personaId);
    } catch (saveErr: any) {
      console.warn('History save failed (non-fatal):', saveErr.message);
    }

    res.json(result);
  } catch (err: any) {
    console.error('Analysis error:', err.message || err);
    if (err.message?.includes('timeout')) {
      return res.status(408).json({ error: 'Analysis timed out. Please try again.' });
    }
    res.status(503).json({ error: 'Analysis service unavailable. Please try again.' });
  }
});

// ==================== Persona Endpoints ====================

app.get('/api/personas', (_req, res) => {
  try {
    const personas = getAllPersonas();
    const result = personas.map(p => ({
      id: p.id,
      name: p.name,
      preview: p.definition.substring(0, 100),
      definition: p.definition,
      isDefault: p.is_default === 1,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
    res.json(result);
  } catch (err: any) {
    console.error('Error fetching personas:', err.message);
    res.status(500).json({ error: 'Failed to fetch personas' });
  }
});

app.post('/api/personas', (req, res) => {
  try {
    const { name, definition } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (name.length > 50) {
      return res.status(400).json({ error: 'Name must be 50 characters or fewer' });
    }
    if (!definition || definition.trim().length === 0) {
      return res.status(400).json({ error: 'Definition is required' });
    }
    if (definition.length > 10000) {
      return res.status(400).json({ error: 'Definition must be 10000 characters or fewer' });
    }

    // Check unique name
    const existing = getAllPersonas().find(p => p.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'A persona with this name already exists' });
    }

    const persona = createPersona(name.trim(), definition.trim());
    res.status(201).json({
      id: persona.id,
      name: persona.name,
      definition: persona.definition,
      preview: persona.definition.substring(0, 100),
      isDefault: persona.is_default === 1,
      createdAt: persona.created_at,
      updatedAt: persona.updated_at,
    });
  } catch (err: any) {
    console.error('Error creating persona:', err.message);
    res.status(500).json({ error: 'Failed to create persona' });
  }
});

app.put('/api/personas/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, definition } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (name.length > 50) {
      return res.status(400).json({ error: 'Name must be 50 characters or fewer' });
    }
    if (!definition || definition.trim().length === 0) {
      return res.status(400).json({ error: 'Definition is required' });
    }
    if (definition.length > 10000) {
      return res.status(400).json({ error: 'Definition must be 10000 characters or fewer' });
    }

    // Check unique name (excluding current persona)
    const existing = getAllPersonas().find(p => p.name.toLowerCase() === name.trim().toLowerCase() && p.id !== id);
    if (existing) {
      return res.status(400).json({ error: 'A persona with this name already exists' });
    }

    const persona = updatePersona(id, name.trim(), definition.trim());
    if (!persona) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    res.json({
      id: persona.id,
      name: persona.name,
      definition: persona.definition,
      preview: persona.definition.substring(0, 100),
      isDefault: persona.is_default === 1,
      createdAt: persona.created_at,
      updatedAt: persona.updated_at,
    });
  } catch (err: any) {
    console.error('Error updating persona:', err.message);
    res.status(500).json({ error: 'Failed to update persona' });
  }
});

app.delete('/api/personas/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = deletePersona(id);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting persona:', err.message);
    res.status(500).json({ error: 'Failed to delete persona' });
  }
});

app.post('/api/personas/import', upload.single('file'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (!ext || !['txt', 'json'].includes(ext)) {
      return res.status(400).json({ error: 'Only .txt and .json files are supported' });
    }

    const content = file.buffer.toString('utf-8');
    let definition: string;
    let suggestedName: string = file.originalname.replace(/\.(txt|json)$/i, '');

    if (ext === 'json') {
      try {
        const parsed = JSON.parse(content);
        definition = parsed.persona_definition;
        if (parsed.name) suggestedName = parsed.name;
        if (!definition) {
          return res.status(400).json({ error: 'JSON file must contain a "persona_definition" field' });
        }
      } catch {
        return res.status(400).json({ error: 'Invalid JSON file' });
      }
    } else {
      definition = content;
    }

    if (!definition || definition.trim().length === 0) {
      return res.status(400).json({ error: 'File contains no content' });
    }
    if (definition.length > 10000) {
      return res.status(400).json({ error: 'Persona definition must be 10000 characters or fewer' });
    }

    // Ensure unique name
    const personas = getAllPersonas();
    let finalName = suggestedName;
    let counter = 1;
    while (personas.find(p => p.name.toLowerCase() === finalName.toLowerCase())) {
      finalName = `${suggestedName} (${counter})`;
      counter++;
    }

    const persona = createPersona(finalName.trim(), definition.trim());
    res.status(201).json({
      id: persona.id,
      name: persona.name,
      definition: persona.definition,
      preview: persona.definition.substring(0, 100),
      isDefault: persona.is_default === 1,
      createdAt: persona.created_at,
      updatedAt: persona.updated_at,
    });
  } catch (err: any) {
    console.error('Error importing persona:', err.message);
    res.status(500).json({ error: 'Failed to import persona' });
  }
});

// ==================== Preferences Endpoints ====================

app.get('/api/preferences', (_req, res) => {
  try {
    const prefs = getAllPreferences();
    res.json(prefs);
  } catch (err: any) {
    console.error('Error fetching preferences:', err.message);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

app.put('/api/preferences', (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || typeof value === 'undefined') {
      return res.status(400).json({ error: 'Key and value are required' });
    }
    setPreference(key, String(value));
    res.json({ key, value: String(value) });
  } catch (err: any) {
    console.error('Error updating preference:', err.message);
    res.status(500).json({ error: 'Failed to update preference' });
  }
});

// ==================== History Endpoints ====================

app.delete('/api/history', (_req, res) => {
  try {
    deleteAllHistory();
    res.json({ success: true, message: 'All analysis history deleted' });
  } catch (err: any) {
    console.error('Error deleting history:', err.message);
    res.status(500).json({ error: 'Failed to delete history' });
  }
});

// ==================== Start Server ====================

app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
  console.log(`📝 Mode: ${USE_REAL_AI ? 'Real AI (OpenAI)' : 'Mock (no API key needed)'}`);
});
