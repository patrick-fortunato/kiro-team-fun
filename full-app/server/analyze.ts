import { GoogleGenerativeAI } from '@google/generative-ai';
import { getPersonaById } from './personas';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MODE_PROMPTS: Record<string, string> = {
  analyze: `You are a tone analysis expert. Analyze the following text for passive-aggressive language patterns.

Return a JSON object with:
- toneScore: integer 1-10 (1=neutral, 10=highly passive-aggressive)
- toneLabel: one of "Neutral" (1-2), "Mildly passive-aggressive" (3-4), "Moderately passive-aggressive" (5-6), "Passive-aggressive" (7-8), "Highly passive-aggressive" (9-10)
- patterns: array of { phrase, category, explanation } where category is one of: indirect_criticism, sarcasm, escalation_language, defensive_phrasing, backhanded_compliment
- honestInterpretation: 1-3 sentences describing how the recipient will perceive this message
- riskIndicators: { misinterpretation: "Low"|"Medium"|"High", defensiveness: "Low"|"Medium"|"High", escalation: "Low"|"Medium"|"High" }
- rewrites: array of 1-3 professional rewrites that preserve all facts, dates, and action items

Return ONLY valid JSON, no markdown fences.`,

  decode: `You are a corporate translator who reveals the TRUE meaning behind professional language.

For each sentence or phrase in the text, provide what the writer ACTUALLY means in brutally honest terms.

Return a JSON object with:
- toneScore: integer 1-10
- toneLabel: the tone label
- decoded: array of { original, translation } where translation is the unfiltered real meaning
- honestInterpretation: 1-3 sentences about how this message really lands

Examples:
- "Per my last email..." → "You clearly didn't read what I sent. I'm documenting this."
- "As previously discussed..." → "I cannot believe I have to say this again."
- "Going forward..." → "You messed up and this is your formal warning."
- "Thanks for your patience" → "I know you're annoyed and I don't care enough to hurry"
- "Just to clarify" → "You're wrong and I'm about to prove it politely"

Return ONLY valid JSON, no markdown fences.`,

  ramp_up: `You are a passive-aggression amplifier. Take normal, professional text and rewrite it to DRIP with passive aggression while technically remaining "professional."

Return a JSON object with:
- toneScore: integer 7-10 (it should be high)
- toneLabel: the tone label
- ramped: the passive-aggressive rewrite of the full message
- techniques: array of strings describing what passive-aggressive techniques you used

Return ONLY valid JSON, no markdown fences.`,

  cool_down: `You are a de-escalation expert. The user wrote this in anger or frustration. Rewrite it to be professional and safe to send while preserving ALL action items, deadlines, and requests.

Return a JSON object with:
- originalToneScore: integer 1-10 (how heated the original is)
- cooledToneScore: integer 1-3 (target)
- toneScore: integer 1-10 (original score)
- toneLabel: label for the original
- cooled: the de-escalated rewrite
- preserved: array of action items/requests preserved from the original
- removed: array of emotional elements that were removed

Return ONLY valid JSON, no markdown fences.`,

  nuclear: `You are an unfiltered honesty translator. Take this message and translate it into what the person REALLY wants to say with ZERO filter. Be brutally honest, funny, and savage. This is for entertainment only.

Return a JSON object with:
- toneScore: integer 1-10 for the original
- toneLabel: tone of the original
- nuclear: the completely unfiltered version — what they'd say if they had no filter and nothing to lose
- disclaimer: a funny one-liner about why this should never be sent

Return ONLY valid JSON, no markdown fences.`
};

export async function analyzeText(text: string, mode: string, personaId?: string) {
  const persona = getPersonaById(personaId);
  const modePrompt = MODE_PROMPTS[mode];

  if (!modePrompt) {
    throw new Error(`Invalid mode: ${mode}`);
  }

  const systemPrompt = `${modePrompt}

PERSONA VOICE (apply this voice/style to any rewrites or translations):
${persona.definition}`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000,
      responseMimeType: 'application/json',
    },
  });

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nTEXT TO ANALYZE:\n${text}` }] }],
    });

    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error('No response from AI provider');
    }

    // Strip markdown fences if present (shouldn't be needed with responseMimeType but just in case)
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return { ...parsed, personaUsed: persona.name, mode };
  } catch (err: any) {
    if (err.name === 'AbortError' || err.message?.includes('timeout')) {
      throw new Error('timeout');
    }
    if (err.message?.includes('API key')) {
      throw new Error('Invalid or missing GEMINI_API_KEY. Check your .env file.');
    }
    throw err;
  }
}
