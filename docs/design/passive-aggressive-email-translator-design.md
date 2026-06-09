# Design Document: Passive-Aggressive Email Translator

## Overview

This document defines the technical design for the Passive-Aggressive Email Translator — a web-based AI tool that analyzes text for passive-aggressive tone, provides scoring and risk assessment, and offers multiple translation/rewrite modes. It is intended to be a lightweight, privacy-first, single-page application with an AI backend.

## Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────┐
│                     Web_UI (SPA)                     │
│                                                     │
│  ┌───────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Text Input│  │ Results View │  │   Persona   │  │
│  │ & Modes   │  │ & Highlights │  │  Management │  │
│  └───────────┘  └──────────────┘  └─────────────┘  │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS/REST
                         ▼
┌─────────────────────────────────────────────────────┐
│                   API Gateway                        │
└────────────────────────┬────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Tone_Analyzer │ │  Rewrite_    │ │   Persona    │
│   Service    │ │  Generator   │ │   Service    │
└──────────────┘ └──────────────┘ └──────────────┘
          │              │
          ▼              ▼
┌─────────────────────────────────────────────────────┐
│              AI/LLM Provider (OpenAI, etc.)          │
└─────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **Web_UI** | Single-page application. Handles text input, mode selection, persona dropdown, results display, phrase highlighting, copy-to-clipboard, and accessibility. |
| **API Gateway** | Routes requests, enforces rate limits, validates input size/format, handles CORS and TLS termination. |
| **Tone_Analyzer Service** | Accepts text, calls AI provider with analysis prompt, returns Tone_Score, Tone_Label, detected patterns with positions, Honest_Interpretation, and Risk_Indicators. |
| **Rewrite_Generator Service** | Accepts text + active Persona + selected mode, calls AI provider with appropriate prompt, returns 1-3 rewrite suggestions or mode-specific translations. |
| **Persona Service** | CRUD operations for Personas. Stores Persona_Definitions. Provides active Persona context to Rewrite_Generator. |

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React + TypeScript | Component-based, strong typing, broad ecosystem. Accessibility libraries available (react-aria). |
| Styling | Tailwind CSS | Utility-first, fast iteration, responsive by default. |
| State | React Context + useReducer | Lightweight for session-scoped state. No Redux needed — no persistence by default. |
| API Layer | Node.js + Express (or Next.js API routes) | TypeScript end-to-end. Familiar stack. Fast to build. |
| AI Provider | OpenAI GPT-4o (or equivalent) | Strong instruction-following for tone analysis and rewrite generation. Structured output support. |
| Persona Storage | SQLite (local file) | Zero-config, file-based, perfect for local-first persistence. Stores personas, analysis history (opt-in), and user preferences. |
| ORM | better-sqlite3 or Drizzle ORM | Synchronous access (better-sqlite3) for speed, or Drizzle for type-safe queries with migration support. |
| Deployment | Local only (localhost) | No cloud deployment. Runs on developer machines. |

---

## Data Flow

### Analysis Request

```
1. User enters text in Web_UI
2. User selects translation mode (Analyze / Decode It / Ramp It Up / Cool It Down / Nuclear Option)
3. Web_UI validates input (1-5000 chars, non-empty)
4. Web_UI sends POST /api/analyze
   Body: { text, mode, personaId? }
5. API Gateway validates, routes to Tone_Analyzer
6. Tone_Analyzer constructs prompt based on mode
7. AI Provider returns structured response
8. Tone_Analyzer parses response, returns to Web_UI:
   {
     toneScore: number,
     toneLabel: string,
     patterns: [{ phrase, startIndex, endIndex, category, explanation }],
     honestInterpretation: string,
     riskIndicators: { misinterpretation, defensiveness, escalation }
   }
9. Web_UI renders results with highlighting
```

### Rewrite Request

```
1. User views analysis results (Tone_Score >= 4 triggers auto-generation)
2. Web_UI sends POST /api/rewrite
   Body: { text, personaId, mode }
3. Rewrite_Generator loads Persona_Definition
4. Rewrite_Generator constructs prompt with Persona voice + mode instructions
5. AI Provider returns 1-3 rewrites
6. Rewrite_Generator validates rewrites preserve entities/dates
7. Returns to Web_UI: { suggestions: [{ text, toneScore }] }
```

---

## API Contracts

### POST /api/analyze

**Request:**
```json
{
  "text": "string (1-5000 chars)",
  "mode": "analyze | decode | ramp_up | cool_down | nuclear"
}
```

**Response (200):**
```json
{
  "toneScore": 7,
  "toneLabel": "Passive-aggressive",
  "patterns": [
    {
      "phrase": "Per my last email",
      "startIndex": 0,
      "endIndex": 17,
      "category": "indirect_criticism",
      "explanation": "This phrase implies the recipient failed to read or act on previous communication."
    }
  ],
  "honestInterpretation": "The reader is likely to feel blamed for not paying attention and may become defensive.",
  "riskIndicators": {
    "misinterpretation": "High",
    "defensiveness": "Medium",
    "escalation": "Low"
  },
  "modeOutput": "You clearly didn't read what I sent. I'm documenting this."
}
```

**Error Responses:**
- `400` — Invalid input (empty, too long, invalid mode)
- `408` — Analysis timeout (>5s)
- `503` — AI provider unavailable

### POST /api/rewrite

**Request:**
```json
{
  "text": "string (1-5000 chars)",
  "personaId": "string (optional, defaults to 'default-professional')",
  "mode": "professional | friendly | direct"
}
```

**Response (200):**
```json
{
  "suggestions": [
    {
      "text": "I wanted to follow up on my previous message regarding...",
      "estimatedToneScore": 2
    }
  ],
  "personaUsed": "AI-Professional"
}
```

### CRUD /api/personas

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/personas | List all personas for current user |
| POST | /api/personas | Create new persona |
| PUT | /api/personas/:id | Update persona |
| DELETE | /api/personas/:id | Delete persona (not default) |
| POST | /api/personas/import | Import from file (.txt/.json) |

---

## Translation Mode Design

Each mode uses a different system prompt strategy when calling the AI provider:

| Mode | Prompt Strategy | Output |
|------|----------------|--------|
| **Analyze** | Standard tone analysis. Detect patterns, score, explain. | Full analysis object |
| **Decode It** | "Translate each sentence into what the writer actually means. Be direct and revealing." | Line-by-line subtext translation |
| **Ramp It Up** | "Rewrite this message to be maximally passive-aggressive while preserving the content." | Passive-aggressive rewrite |
| **Cool It Down** | "This message was written in anger. Rewrite it to be professional and safe to send. Preserve all action items." | De-escalated rewrite |
| **Nuclear Option** | "Translate this into what the person really wants to say with zero filter. Be brutally honest and funny." | Unfiltered interpretation |

---

## Persona System Design

### Storage Model

```json
{
  "id": "uuid",
  "name": "Friendly Manager",
  "definition": "You communicate with warmth and empathy. You acknowledge feelings before addressing issues...",
  "isDefault": false,
  "createdAt": "2026-06-09T...",
  "updatedAt": "2026-06-09T..."
}
```

### Default Persona (AI-Professional)

Pre-loaded, non-deletable. Definition:
> "You are a professional communication coach. Rewrite messages to be clear, respectful, and direct. Maintain a neutral, business-appropriate tone. Preserve all factual content, deadlines, and action items."

### Persona Integration with Modes

The active Persona influences the **voice** of the output, while the **mode** controls what transformation is applied. They compose together:

- Decode It + "Snarky Coworker" persona → decoded with humor
- Cool It Down + "Friendly Manager" persona → de-escalated with warmth
- Nuclear Option + any persona → persona voice shapes the honesty style

---

## Database Schema (SQLite)

Database file: `./data/translator.db` (gitignored)

```sql
-- Personas table
CREATE TABLE personas (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed default persona
INSERT INTO personas (id, name, definition, is_default) VALUES (
  'default-professional',
  'AI-Professional',
  'You are a professional communication coach. Rewrite messages to be clear, respectful, and direct. Maintain a neutral, business-appropriate tone. Preserve all factual content, deadlines, and action items.',
  1
);

-- Analysis history (opt-in)
CREATE TABLE analysis_history (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
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

-- Detected patterns per analysis
CREATE TABLE detected_patterns (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  analysis_id TEXT NOT NULL REFERENCES analysis_history(id) ON DELETE CASCADE,
  phrase TEXT NOT NULL,
  start_index INTEGER NOT NULL,
  end_index INTEGER NOT NULL,
  category TEXT NOT NULL,
  explanation TEXT NOT NULL
);

-- Saved rewrites
CREATE TABLE rewrites (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  analysis_id TEXT NOT NULL REFERENCES analysis_history(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  estimated_tone_score INTEGER,
  persona_id TEXT REFERENCES personas(id) ON DELETE SET NULL
);

-- User preferences
CREATE TABLE preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO preferences (key, value) VALUES ('history_enabled', 'false');
```

---

## Privacy Design

| Concern | Approach |
|---------|----------|
| Text persistence | Stored in local SQLite database file on the user's machine. No external transmission except to AI provider during analysis. |
| Session data | Analysis results persisted to SQLite if user opts in. Otherwise discarded on page close. |
| Persona storage | SQLite — always persisted locally. Survives browser cache clears. |
| Analysis history | Stored in SQLite with opt-in consent toggle. Deletable on demand via UI or direct DB deletion. |
| Transport | HTTPS/TLS required for AI provider API calls. All other data stays local. |
| AI provider | Text sent to AI provider for processing. No training on user data (use API agreements that prohibit training). |
| Database file | Stored in project directory (e.g., `./data/translator.db`). Gitignored by default. User owns their data. |

---

## UI Layout (Wireframe Description)

### Main View

```
┌─────────────────────────────────────────────────┐
│  [Logo]  Passive-Aggressive Email Translator     │
│           [Persona: ▼ AI-Professional]  [⚙️]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │  Enter your text here...                  │  │
│  │                                           │  │
│  │                                           │  │
│  │                                  742/5000 │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  [Analyze] [Decode It] [Ramp It Up]             │
│  [Cool It Down] [☢️ Nuclear Option]             │
│                                                 │
├─────────────────────────────────────────────────┤
│  RESULTS                                        │
│                                                 │
│  Tone Score: ███████░░░ 7/10                    │
│  Label: "Passive-aggressive"        [🔴 High]  │
│                                                 │
│  Risk: Misinterpretation [High]                 │
│        Defensiveness [Medium]                   │
│        Escalation [Low]                         │
│                                                 │
│  ⚠️ High risk detected. Consider revising.     │
│                                                 │
│  Honest Interpretation:                         │
│  "The reader will likely feel blamed and may    │
│   become defensive about the timeline."         │
│                                                 │
├─────────────────────────────────────────────────┤
│  HIGHLIGHTED TEXT                               │
│                                                 │
│  "~~~Per my last email~~~, I wanted to check    │
│   on the ~~~status of this, again~~~."          │
│                                                 │
│  [Per my last email] → indirect_criticism       │
│  "Implies recipient ignored previous message"   │
│                                                 │
├─────────────────────────────────────────────────┤
│  SUGGESTED REWRITES (AI-Professional)           │
│                                                 │
│  ○ "I'm following up on the timeline we        │
│     discussed. Could you share an update?"      │
│                                                 │
│  ○ "Checking in — do you have an ETA on        │
│     the deliverable from our last thread?"      │
│                                                 │
│  [Select & Edit]  [📋 Copy]                    │
└─────────────────────────────────────────────────┘
```

---

## Performance Strategy

| Requirement | Approach |
|-------------|----------|
| <1s for ≤2000 chars | Stream AI response. Use structured output mode for predictable parsing. Cache common phrase patterns. |
| <2s for 2001-5000 chars | Same streaming approach. Slightly longer due to token count. |
| <3s for rewrites | Parallel generation if multiple suggestions needed. |
| 50 concurrent users | N/A — local only. Single-user performance is the target. |
| Loading indicator <200ms | Frontend shows immediately on submit, before API responds. |
| Timeout at 5s | API gateway enforces timeout. Client shows retry on 408. |

---

## Accessibility Implementation

| WCAG Requirement | Implementation |
|------------------|----------------|
| Color not sole indicator | All color indicators paired with text labels and/or icons. Highlights use underline + color. |
| Keyboard navigation | Logical tab order. Focus management on result display. All actions keyboard-accessible. |
| Screen reader support | ARIA live regions for dynamic content. Role attributes on interactive elements. |
| Focus management | On analysis complete, focus moves to results. On phrase select, focus moves to explanation. |

---

## Security Considerations

| Risk | Mitigation |
|------|-----------|
| Prompt injection via user text | Sanitize input before constructing AI prompts. Use system/user message separation. Never embed user text directly in system prompt. |
| XSS via AI response | Sanitize all AI output before rendering in DOM. Use React's built-in escaping. |
| Data leakage | No server-side persistence by default. No logging of user text content. |
| Rate limiting | Not required for local use. Optional if exposed on a network. |
| AI provider data use | Use API tier that contractually prohibits training on input data. |

---

## Open Questions

1. **AI Provider choice** — OpenAI GPT-4o is assumed. Should we support multiple providers or allow self-hosted models?
2. **Team sharing** — Should Personas be shareable between team members (e.g., via exported files)?
3. **API Key management** — User provides their own API key via environment variable, or shared team key?

---

## Implementation Phases

### Phase 1: Core Analysis (MVP)
- Text input with character counter
- Tone_Analyzer integration (Analyze mode only)
- Tone scoring with color indicators
- Phrase highlighting with explanations
- Honest Interpretation
- Risk Indicators
- Basic error handling

### Phase 2: Rewrites & Modes
- Rewrite_Generator with Default_Persona
- All four translation modes (Decode It, Ramp It Up, Cool It Down, Nuclear Option)
- Copy-to-clipboard
- Select and edit rewrites

### Phase 3: Persona System
- Persona CRUD (create, read, update, delete)
- File import (.txt, .json)
- Copy-paste creation
- Persona dropdown on analysis view
- Persona + Mode composition

### Phase 4: Polish
- Accessibility audit and remediation
- Performance optimization
- README with local setup instructions
