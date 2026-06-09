import { getPersonaById } from './personas';

// Passive-aggressive phrases we detect
const PA_PATTERNS: { regex: RegExp; category: string; explanation: string }[] = [
  { regex: /per my last email/i, category: 'indirect_criticism', explanation: 'Implies the recipient failed to read or act on previous communication.' },
  { regex: /as (previously|already) (discussed|mentioned|noted|stated)/i, category: 'indirect_criticism', explanation: 'Suggests the recipient should already know this and is wasting your time.' },
  { regex: /going forward/i, category: 'escalation_language', explanation: 'Often used as a veiled warning that mistakes won\'t be tolerated again.' },
  { regex: /just to clarify/i, category: 'indirect_criticism', explanation: 'Implies the other person is confused or wrong, framed as helpfulness.' },
  { regex: /i('m| am) looping in/i, category: 'escalation_language', explanation: 'Signals escalation — bringing in authority to apply pressure.' },
  { regex: /as i('m| am) sure you('re| are) aware/i, category: 'sarcasm', explanation: 'Sarcastically implies the recipient is clearly NOT aware.' },
  { regex: /thanks for (finally|eventually)/i, category: 'sarcasm', explanation: 'Backhanded gratitude that emphasizes the delay.' },
  { regex: /no worries/i, category: 'sarcasm', explanation: 'Often means "I definitely have worries and I\'m noting this."' },
  { regex: /friendly reminder/i, category: 'indirect_criticism', explanation: 'Neither friendly nor just a reminder — it\'s a demand with a smile.' },
  { regex: /not sure (if|what) you/i, category: 'defensive_phrasing', explanation: 'Passive way of saying "you clearly didn\'t do what I expected."' },
  { regex: /that('s| is) not my (responsibility|job|problem)/i, category: 'defensive_phrasing', explanation: 'Deflecting ownership while creating distance.' },
  { regex: /hope(fully)? this helps/i, category: 'sarcasm', explanation: 'Can imply "I shouldn\'t have to explain this but here we are."' },
  { regex: /correct me if i('m| am) wrong/i, category: 'indirect_criticism', explanation: 'Passive way of asserting you\'re right while daring them to disagree.' },
  { regex: /with all due respect/i, category: 'backhanded_compliment', explanation: 'Almost always precedes something disrespectful.' },
  { regex: /great job,? (considering|given|for)/i, category: 'backhanded_compliment', explanation: 'Praise that immediately undermines itself with a qualifier.' },
  { regex: /please advise/i, category: 'escalation_language', explanation: 'Corporate-speak for "the ball is in your court and I\'m documenting this."' },
  { regex: /as per (my|our|the) (email|message|request|conversation)/i, category: 'indirect_criticism', explanation: 'Paper trail language — establishing you already communicated this.' },
  { regex: /gentle reminder/i, category: 'indirect_criticism', explanation: 'There is nothing gentle about it. It means "do this NOW."' },
  { regex: /moving forward/i, category: 'escalation_language', explanation: 'Signals the current situation is unacceptable and things must change.' },
  { regex: /any update(s)? on this/i, category: 'indirect_criticism', explanation: 'Polite version of "why haven\'t you done this yet?"' },
];

const DECODE_MAP: { regex: RegExp; translation: string }[] = [
  { regex: /per my last email/i, translation: "You clearly didn't read what I sent. I'm documenting this." },
  { regex: /as (previously|already) (discussed|mentioned|noted|stated)/i, translation: "I cannot believe I have to say this again." },
  { regex: /going forward/i, translation: "You messed up and this is your formal warning." },
  { regex: /just to clarify/i, translation: "You're wrong and I'm about to prove it politely." },
  { regex: /friendly reminder/i, translation: "This is your LAST reminder before I escalate." },
  { regex: /gentle reminder/i, translation: "DO IT. NOW. I'm smiling through gritted teeth." },
  { regex: /please advise/i, translation: "The ball is in your court. I'm watching. And documenting." },
  { regex: /hope(fully)? this helps/i, translation: "I shouldn't have to explain this but here we are." },
  { regex: /no worries/i, translation: "I have many worries. All of them are about you." },
  { regex: /thanks for (finally|eventually)/i, translation: "About time. I've been silently furious." },
  { regex: /correct me if i('m| am) wrong/i, translation: "I'm not wrong and we both know it." },
  { regex: /with all due respect/i, translation: "I have zero respect for what you're about to hear." },
  { regex: /as i('m| am) sure you('re| are) aware/i, translation: "You're clearly NOT aware, which is embarrassing for you." },
  { regex: /any update(s)? on this/i, translation: "Why haven't you done this yet? I'm losing patience." },
  { regex: /i('m| am) looping in/i, translation: "I'm tattling to someone with authority because you won't listen to me." },
  { regex: /moving forward/i, translation: "What happened before was unacceptable and I want it on record." },
  { regex: /not sure (if|what) you/i, translation: "You definitely didn't do what I expected and I'm annoyed." },
];

function detectPatterns(text: string) {
  const found: { phrase: string; category: string; explanation: string }[] = [];
  for (const pattern of PA_PATTERNS) {
    const match = text.match(pattern.regex);
    if (match) {
      found.push({
        phrase: match[0],
        category: pattern.category,
        explanation: pattern.explanation,
      });
    }
  }
  return found;
}

function calculateScore(patterns: { phrase: string; category: string; explanation: string }[]): number {
  if (patterns.length === 0) return 1;
  return Math.min(10, Math.max(2, patterns.length * 2 + 1));
}

function getLabel(score: number): string {
  if (score <= 2) return 'Neutral';
  if (score <= 4) return 'Mildly passive-aggressive';
  if (score <= 6) return 'Moderately passive-aggressive';
  if (score <= 8) return 'Passive-aggressive';
  return 'Highly passive-aggressive';
}

function getRisk(patterns: { phrase: string; category: string; explanation: string }[]) {
  const score = calculateScore(patterns);
  const defensive = patterns.filter(p => p.category === 'defensive_phrasing').length;
  const escalation = patterns.filter(p => p.category === 'escalation_language').length;

  return {
    misinterpretation: score <= 3 ? 'Low' : score <= 6 ? 'Medium' : 'High',
    defensiveness: defensive === 0 ? 'Low' : defensive <= 2 ? 'Medium' : 'High',
    escalation: escalation === 0 ? 'Low' : escalation === 1 ? 'Medium' : 'High',
  };
}

function mockAnalyze(text: string, personaName: string) {
  const patterns = detectPatterns(text);
  const score = calculateScore(patterns);
  const label = getLabel(score);
  const risk = getRisk(patterns);

  const interpretations: Record<string, string> = {
    high: `The reader will likely feel attacked or blamed. They may become defensive and disengage from productive conversation. This message reads as confrontational despite its professional veneer.`,
    medium: `The reader may sense underlying frustration in this message. Some phrases could trigger defensiveness, though the overall tone isn't overtly hostile.`,
    low: `This message reads as neutral and professional. The recipient is unlikely to feel targeted or defensive.`,
  };

  const rewrites = score >= 4 ? [
    `I wanted to follow up on our previous discussion. Could you share a status update when you have a moment? Happy to jump on a quick call if that's easier.`,
    `Checking in on this — I want to make sure we're aligned on next steps. Let me know if there's anything blocking progress.`,
    `Hi! Just circling back on this item. No rush, but wanted to make sure it's still on your radar. Let me know if you need anything from my end.`,
  ] : [];

  return {
    toneScore: score,
    toneLabel: label,
    patterns,
    honestInterpretation: score >= 7 ? interpretations.high : score >= 4 ? interpretations.medium : interpretations.low,
    riskIndicators: risk,
    rewrites,
    personaUsed: personaName,
    mode: 'analyze',
  };
}

function mockDecode(text: string, personaName: string) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const decoded: { original: string; translation: string }[] = [];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    let translated = false;
    for (const entry of DECODE_MAP) {
      if (entry.regex.test(trimmed)) {
        decoded.push({ original: trimmed, translation: entry.translation });
        translated = true;
        break;
      }
    }
    if (!translated) {
      const genericDecodes = [
        "I'm saying this nicely but I mean it aggressively.",
        "This is filler to make the email seem less hostile.",
        "Translation: just do what I asked.",
        "I'm being professional but I'm internally screaming.",
        "This part is actually fine. Surprisingly.",
      ];
      decoded.push({
        original: trimmed,
        translation: genericDecodes[Math.floor(Math.random() * genericDecodes.length)],
      });
    }
  }

  const score = Math.min(10, decoded.length + 2);
  return {
    toneScore: score,
    toneLabel: getLabel(score),
    decoded,
    honestInterpretation: "Behind the professional language, this message is essentially saying: 'I'm frustrated, you dropped the ball, and I want you to know I noticed.'",
    personaUsed: personaName,
    mode: 'decode',
  };
}

function mockRampUp(text: string, personaName: string) {
  const ramped = `Per my last email (which I'm sure you thoroughly read and absorbed), I just wanted to circle back on this. As I'm sure you're already aware, this was discussed previously — but no worries at all that it seems to have slipped through the cracks! 😊

I'm sure you've been incredibly busy with other priorities, so I completely understand. That said, going forward, it would be really helpful if we could stay aligned on timelines. I've gone ahead and looped in [manager] just for visibility purposes — nothing to worry about!

Thanks so much for your patience with my friendly reminders. Please advise at your earliest convenience.

Best,
[Your name] ✨`;

  return {
    toneScore: 9,
    toneLabel: 'Highly passive-aggressive',
    ramped,
    techniques: [
      'Per my last email (paper trail)',
      'Backhanded understanding',
      'Smiley emoji as weapon',
      'Looping in manager "for visibility"',
      'Friendly reminder escalation',
      '"Please advise" power move',
    ],
    personaUsed: personaName,
    mode: 'ramp_up',
  };
}

function mockCoolDown(text: string, personaName: string) {
  const cooled = `Hi team,

I wanted to follow up on the item we discussed earlier. I understand everyone has a full plate right now, and I appreciate the effort that's gone into this so far.

Could we align on a realistic timeline for next steps? I'm happy to help remove any blockers or adjust priorities if needed.

Let me know what works best — happy to chat live if that's easier.

Thanks!`;

  return {
    originalToneScore: 8,
    cooledToneScore: 2,
    toneScore: 8,
    toneLabel: 'Passive-aggressive',
    cooled,
    preserved: [
      'Follow-up request',
      'Timeline alignment',
      'Offer to help',
      'Request for response',
    ],
    removed: [
      'Blame language',
      'Passive-aggressive phrases',
      'Escalation triggers',
      'Sarcastic undertones',
    ],
    personaUsed: personaName,
    mode: 'cool_down',
  };
}

function mockNuclear(text: string, personaName: string) {
  const patterns = detectPatterns(text);
  const score = calculateScore(patterns);

  const nuclearVersions = [
    `Look, I've asked you about this THREE TIMES now. At this point I'm not sure if you can't read, don't care, or are actively ignoring me as some kind of power move. Either way, DO THE THING. It's not complicated. A golden retriever could follow up on an email faster than you. I'm not asking again — next time it goes straight to your manager with a subject line that includes the word "accountability."`,
    `I genuinely cannot believe we're still having this conversation. I sent you an email. You ignored it. I sent another. You ignored that too. So now here I am, writing a THIRD message like some kind of corporate Groundhog Day. Please, for the love of all that is holy, just do the one thing I asked. It's not a riddle. It's not a puzzle. It's a task. Complete it. Today. Right now. I'll wait.`,
    `Real talk? I wrote you a polite email. Then a polite follow-up. And now I'm writing this one where I drop the act entirely. You know what you need to do. I know what you need to do. Your manager knows what you need to do. The only mystery here is WHY YOU HAVEN'T DONE IT YET. Consider this my final transmission before I go full "reply all" with receipts.`,
  ];

  return {
    toneScore: score,
    toneLabel: getLabel(score),
    nuclear: nuclearVersions[Math.floor(Math.random() * nuclearVersions.length)],
    disclaimer: "Sending this would be a career-limiting move. But reading it out loud is free therapy. 🎤⬇️",
    personaUsed: personaName,
    mode: 'nuclear',
  };
}

export async function mockAnalyzeText(text: string, mode: string, personaId?: string) {
  const persona = getPersonaById(personaId);

  // Simulate slight delay for realism
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

  switch (mode) {
    case 'analyze': return mockAnalyze(text, persona.name);
    case 'decode': return mockDecode(text, persona.name);
    case 'ramp_up': return mockRampUp(text, persona.name);
    case 'cool_down': return mockCoolDown(text, persona.name);
    case 'nuclear': return mockNuclear(text, persona.name);
    default: return mockAnalyze(text, persona.name);
  }
}
