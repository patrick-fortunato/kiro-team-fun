# Implementation Tasks: Passive-Aggressive Email Translator

## Phase 1: Project Setup & Core Infrastructure

- [x] 1. Initialize project structure
  - [x] 1.1 Create Node.js + TypeScript project with Express backend
  - [x] 1.2 Create React + TypeScript frontend with Tailwind CSS
  - [x] 1.3 Configure dev scripts (concurrent frontend + backend)
  - [x] 1.4 Add .gitignore (include `./data/translator.db`)

- [x] 2. SQLite database setup
  - [x] 2.1 Install better-sqlite3 and create database initialization module
  - [x] 2.2 Create schema migration script (personas, analysis_history, detected_patterns, rewrites, preferences tables)
  - [x] 2.3 Seed default AI-Professional persona on first run
  - [x] 2.4 Auto-import team personas from `data/seed-personas/*.json` on first run
  - [x] 2.5 Add database connection utility with auto-create on startup

- [x] 3. AI provider integration
  - [x] 3.1 Create OpenAI client wrapper with API key from environment variable
  - [x] 3.2 Implement structured output parsing for analysis responses
  - [x] 3.3 Add timeout handling (5s max) and error mapping (503 for unavailable, 408 for timeout)

## Phase 2: Core Analysis (MVP)

- [x] 4. POST /api/analyze endpoint
  - [x] 4.1 Input validation (1-5000 chars, non-empty, valid mode)
  - [x] 4.2 Construct system prompt for tone analysis (Analyze mode)
  - [x] 4.3 Parse AI response into structured format (toneScore, toneLabel, patterns, honestInterpretation, riskIndicators)
  - [x] 4.4 Return 400/408/503 error responses appropriately

- [x] 5. Frontend: Text input & submission
  - [x] 5.1 Text input area with live character counter (current/5000)
  - [x] 5.2 Disable submit when empty/whitespace-only
  - [x] 5.3 Show error when exceeding 5000 characters
  - [x] 5.4 Mode selector buttons (Analyze, Decode It, Ramp It Up, Cool It Down, Nuclear Option)
  - [x] 5.5 Loading indicator shown within 200ms of submission

- [x] 6. Frontend: Results display
  - [x] 6.1 Tone score with color indicator (green 1-3, yellow 4-6, red 7-10) and text label
  - [x] 6.2 Risk indicators with category labels and Low/Medium/High ratings
  - [x] 6.3 Warning message when any risk is High
  - [x] 6.4 Honest Interpretation display
  - [x] 6.5 Phrase highlighting with click-to-explain (category + explanation)

## Phase 3: Rewrites & Translation Modes

- [x] 7. POST /api/rewrite endpoint
  - [x] 7.1 Accept text + personaId + mode
  - [x] 7.2 Load persona definition from SQLite
  - [x] 7.3 Construct prompt with persona voice + mode instructions
  - [x] 7.4 Return 1-3 suggestions with estimated tone scores

- [x] 8. Translation mode prompts
  - [x] 8.1 Implement "Decode It" system prompt (line-by-line subtext translation)
  - [x] 8.2 Implement "Ramp It Up" system prompt (maximize passive aggression)
  - [x] 8.3 Implement "Cool It Down" system prompt (de-escalate, preserve action items)
  - [x] 8.4 Implement "Nuclear Option" system prompt (unfiltered honesty + humor)

- [x] 9. Frontend: Rewrites & modes UI
  - [x] 9.1 Display 1-3 rewrite suggestions with radio selection
  - [x] 9.2 Editable text field on selection (max 5000 chars)
  - [x] 9.3 Copy-to-clipboard with 3s confirmation message
  - [x] 9.4 Nuclear Option disclaimer banner
  - [x] 9.5 Mode switching without clearing input text

## Phase 4: Persona System

- [x] 10. CRUD /api/personas endpoints
  - [x] 10.1 GET /api/personas — list all with name + 100-char preview
  - [x] 10.2 POST /api/personas — create (validate name 1-50, definition 1-10000, unique name)
  - [x] 10.3 PUT /api/personas/:id — update (same validations)
  - [x] 10.4 DELETE /api/personas/:id — delete with default-persona protection
  - [x] 10.5 POST /api/personas/import — file upload (.txt/.json, max 500KB)

- [x] 11. Frontend: Persona management
  - [x] 11.1 Persona library view (list with previews)
  - [x] 11.2 Create/edit form with validation messages
  - [x] 11.3 Delete confirmation prompt + revert to default if active
  - [x] 11.4 File import (.txt/.json) with error handling
  - [x] 11.5 Copy-paste creation option

- [x] 12. Frontend: Persona selection on analysis view
  - [x] 12.1 Dropdown sorted alphabetically, default persona first
  - [x] 12.2 Regenerate rewrites on persona change with loading indicator
  - [x] 12.3 Display active persona name alongside suggestions

## Phase 5: Privacy, History & Polish

- [x] 13. Analysis history (opt-in)
  - [x] 13.1 Preferences API (GET/PUT /api/preferences) backed by SQLite
  - [x] 13.2 Consent toggle in UI — persist to preferences table
  - [x] 13.3 Save analysis results to analysis_history + detected_patterns + rewrites when enabled
  - [x] 13.4 Delete all history on user request (within 5s, confirmation message)

- [x] 14. Accessibility
  - [x] 14.1 ARIA live regions for dynamic results, rewrites, and errors
  - [x] 14.2 Keyboard navigation with visible focus indicators and logical tab order
  - [x] 14.3 Non-color indicators (underline for highlights, text labels for scores/risks)
  - [x] 14.4 Focus management (move focus to results on analysis complete, to explanation on phrase select)

- [x] 15. Error handling & UX
  - [x] 15.1 Preserve input text on all errors
  - [x] 15.2 Retry actions for timeout, network, and service errors
  - [x] 15.3 Privacy notice visible before text entry
  - [x] 15.4 Generic error display (no internal details exposed)

- [x] 16. Documentation
  - [x] 16.1 README with local setup instructions (install, env vars, run)
  - [x] 16.2 Document API key configuration (.env.example)
