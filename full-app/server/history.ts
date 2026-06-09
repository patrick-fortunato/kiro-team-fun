import { v4 as uuidv4 } from 'uuid';
import { getDb } from './database';

export interface AnalysisRecord {
  id: string;
  original_text: string;
  mode: string;
  tone_score: number;
  tone_label: string;
  honest_interpretation: string | null;
  risk_misinterpretation: string | null;
  risk_defensiveness: string | null;
  risk_escalation: string | null;
  persona_id: string | null;
  created_at: string;
}

export function isHistoryEnabled(): boolean {
  const db = getDb();
  const pref = db.prepare('SELECT value FROM preferences WHERE key = ?').get('history_enabled') as { value: string } | undefined;
  return pref?.value === 'true';
}

export function saveAnalysis(
  originalText: string,
  mode: string,
  result: any,
  personaId?: string
): string | null {
  if (!isHistoryEnabled()) return null;

  const db = getDb();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO analysis_history (id, original_text, mode, tone_score, tone_label, honest_interpretation, risk_misinterpretation, risk_defensiveness, risk_escalation, persona_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    originalText,
    mode,
    result.toneScore || 0,
    result.toneLabel || '',
    result.honestInterpretation || null,
    result.riskIndicators?.misinterpretation || null,
    result.riskIndicators?.defensiveness || null,
    result.riskIndicators?.escalation || null,
    personaId || null
  );

  // Save detected patterns
  if (result.patterns && Array.isArray(result.patterns)) {
    const insertPattern = db.prepare(`
      INSERT INTO detected_patterns (id, analysis_id, phrase, start_index, end_index, category, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const pattern of result.patterns) {
      insertPattern.run(
        uuidv4(),
        id,
        pattern.phrase,
        pattern.startIndex || 0,
        pattern.endIndex || 0,
        pattern.category,
        pattern.explanation
      );
    }
  }

  // Save rewrites
  if (result.rewrites && Array.isArray(result.rewrites)) {
    const insertRewrite = db.prepare(`
      INSERT INTO rewrites (id, analysis_id, text, estimated_tone_score, persona_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const rewrite of result.rewrites) {
      const text = typeof rewrite === 'string' ? rewrite : rewrite.text;
      const score = typeof rewrite === 'string' ? null : rewrite.estimatedToneScore;
      insertRewrite.run(uuidv4(), id, text, score, personaId || null);
    }
  }

  return id;
}

export function deleteAllHistory(): void {
  const db = getDb();
  db.prepare('DELETE FROM detected_patterns').run();
  db.prepare('DELETE FROM rewrites').run();
  db.prepare('DELETE FROM analysis_history').run();
}
