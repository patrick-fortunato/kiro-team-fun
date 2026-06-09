# 📧 Passive-Aggressive Email Translator

Decode corporate speak. De-escalate drama. Or go nuclear.

## Quick Start

### 1. Get an OpenAI API key

Copy `.env.example` to `.env` and add your key:

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### 2. Install dependencies

```bash
npm install
cd client && npm install && cd ..
```

### 3. Run it

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Modes

| Mode | What it does |
|------|-------------|
| 🔍 **Analyze** | Detects passive-aggressive patterns, scores tone 1-10, highlights problems, suggests rewrites |
| 🕵️ **Decode It** | Reveals the TRUE meaning behind corporate speak |
| 🔥 **Ramp It Up** | Takes normal text and makes it drip with passive aggression |
| ❄️ **Cool It Down** | Takes angry text and makes it safe to send |
| ☢️ **Nuclear Option** | Full unfiltered honesty (for entertainment only!) |

## Voices

Each mode can be combined with a team member's communication voice:

- **AI-Professional** — neutral, coaching tone
- **Audrey** — direct, structured, lightly playful
- **Patrick** — peer-to-peer, 30 years of "I've seen it all"
- **Ixshel** — clarity-first, bridges business and tech
- **Katie** — action-oriented manager
- **Landan** — perfectionist about readability
- **Josh** — collaborative, systems thinker
- **Manoj** — precise, surfaces edge cases
- **Manuel** — concise boss mode

## Tech Stack

- React + TypeScript + Tailwind CSS (frontend)
- Express + TypeScript (backend)
- OpenAI GPT-4o (AI)
- No database — everything is ephemeral
