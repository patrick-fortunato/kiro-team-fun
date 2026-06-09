import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { mockAnalyzeText } from './mock-analyze';

// Set to true to use real OpenAI API (requires OPENAI_API_KEY in .env)
const USE_REAL_AI = false;

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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

    res.json(result);
  } catch (err: any) {
    console.error('Analysis error:', err.message);
    if (err.message?.includes('timeout')) {
      return res.status(408).json({ error: 'Analysis timed out. Please try again.' });
    }
    res.status(503).json({ error: 'Analysis service unavailable. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
  console.log(`📝 Mode: ${USE_REAL_AI ? 'Real AI (OpenAI)' : 'Mock (no API key needed)'}`);
});
