# Passive-Aggressive Email Translator (Full App)

A web-based AI tool that analyzes text for passive-aggressive tone, provides scoring and risk assessment, and offers multiple translation/rewrite modes — powered by OpenAI (or mock mode for local development).

## Features

- **Analyze** — Detect passive-aggressive patterns with tone scoring and risk indicators
- **Decode It** — Reveal what corporate-speak actually means
- **Ramp It Up** — Amplify passive aggression to comical levels
- **Cool It Down** — De-escalate heated messages into professional rewrites
- **Nuclear Option** — Unfiltered honesty (for entertainment only)
- **9 Pre-loaded Personas** — Different communication voices (AI-Professional, Audrey, Patrick, Ixshel, Katie, Landan, Josh, Manoj, Manuel)
- **Persona CRUD** — Create, edit, delete, and import custom personas
- **Privacy-First** — No data stored by default; opt-in history with local SQLite
- **Dark Theme UI** — Clean, accessible interface

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite via better-sqlite3
- **AI:** OpenAI GPT-4o (with mock fallback)
- **Dev:** concurrently for frontend + backend

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
cd full-app
npm install
cd client && npm install && cd ..
```

### Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` to configure:

```env
# Use mock mode (default) — no API key needed
USE_REAL_AI=false

# Or use real OpenAI API
USE_REAL_AI=true
OPENAI_API_KEY=sk-your-key-here
```

### Running

```bash
npm run dev
```

This starts both:
- Backend API at http://localhost:3001
- Frontend at http://localhost:3000

### Mock Mode vs Real AI

The app defaults to **mock mode** (`USE_REAL_AI=false`), which uses regex-based pattern detection and pre-written responses. This requires no API key and is great for development.

Set `USE_REAL_AI=true` in your `.env` file and provide an `OPENAI_API_KEY` to use real AI-powered analysis.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/analyze | Analyze text (modes: analyze, decode, ramp_up, cool_down, nuclear) |
| GET | /api/personas | List all personas |
| POST | /api/personas | Create persona |
| PUT | /api/personas/:id | Update persona |
| DELETE | /api/personas/:id | Delete persona |
| POST | /api/personas/import | Import persona from file |
| GET | /api/preferences | Get user preferences |
| PUT | /api/preferences | Update preference |
| DELETE | /api/history | Delete all analysis history |

## Database

SQLite database is auto-created at `./data/translator.db` on first run. The database file is gitignored.

Tables: `personas`, `analysis_history`, `detected_patterns`, `rewrites`, `preferences`

## Seed Personas

On first run, the app automatically imports personas from `../data/seed-personas/*.json`. The default AI-Professional persona is always available and cannot be deleted.
