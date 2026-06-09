# Requirements Document

## Introduction

The Passive-Aggressive Email Translator is a web-based AI-powered tone analysis tool that detects passive-aggressive language patterns in user-entered text and provides professional rewrite suggestions. The tool helps employees improve communication clarity, reduce misinterpretation, and maintain professional standards in internal and customer-facing communications. The system operates with a privacy-first approach, performing analysis in near real-time without persisting user content by default.

## Glossary

- **Tone_Analyzer**: The core AI engine that processes user-entered text and identifies passive-aggressive language patterns, assigns tone scores, and generates explanations.
- **Rewrite_Generator**: The component that produces alternative phrasings of flagged text in multiple tone modes (professional, friendly, direct).
- **Tone_Score**: A severity rating assigned to analyzed text indicating the degree of passive-aggressive tone detected, expressed as a numeric value on a 1-10 scale.
- **Tone_Label**: A human-readable summary of the overall tone assessment (e.g., "Mildly passive-aggressive", "Highly confrontational").
- **Phrase_Highlighter**: The UI component that visually marks problematic phrases within the user's text and associates each with an explanation.
- **Honest_Interpretation**: A plain-language description of how a recipient is likely to perceive the analyzed message.
- **Risk_Indicator**: A visual marker showing the likelihood that a message will cause misinterpretation, defensiveness, or escalation in the recipient.
- **Analysis_Session**: A single instance of text submission, analysis, and result display that exists only in the user's browser session.
- **Tone_Mode**: A selectable rewrite style that controls the voice and register of generated suggestions (professional, friendly, or direct).
- **Persona**: A named voice configuration that defines the personality, tone, style, and communication approach used by the Rewrite_Generator when producing suggestions. Each Persona contains a set of instructions (a "soul") that guides how rewrites are phrased.
- **Persona_Library**: The persistent collection of all user-created and imported Personas available for selection in the Web_UI.
- **Default_Persona**: The AI-Professional Persona that is pre-configured and selected by default when no other Persona is active.
- **Persona_Definition**: The text-based content (instructions, style rules, tone guidance) that defines a Persona's behavior. Can be authored inline, pasted as text, or imported from a file.
- **Web_UI**: The browser-based interface through which users interact with the Passive-Aggressive Email Translator.

## Requirements

### Requirement 1: Real-Time Text Analysis

**User Story:** As an employee composing a message, I want the system to analyze my text in near real-time, so that I receive immediate feedback on tone before sending.

#### Acceptance Criteria

1. WHEN a user submits text for analysis, THE Tone_Analyzer SHALL accept text input between 1 and 5000 characters in length.
2. WHEN a user submits valid text, THE Tone_Analyzer SHALL return complete analysis results (Tone_Score, Tone_Label, detected patterns, Honest_Interpretation, and Risk_Indicators) within 2 seconds of submission.
3. IF the submitted text exceeds 5000 characters, THEN THE Web_UI SHALL display an error message indicating the maximum character limit and prevent submission.
4. IF the submitted text is empty or contains only whitespace characters, THEN THE Web_UI SHALL disable the analysis action and display a prompt to enter text.
5. WHILE a user is composing text in the input field, THE Web_UI SHALL display a live character count showing the current length relative to the 5000-character maximum.

### Requirement 2: Passive-Aggressive Pattern Detection

**User Story:** As an employee, I want the system to identify specific passive-aggressive language patterns, so that I understand which parts of my message may be problematic.

#### Acceptance Criteria

1. WHEN text is submitted for analysis, THE Tone_Analyzer SHALL detect indirect criticism patterns (e.g., "As I previously mentioned", "Per my last email") and return each detected phrase with its position in the original text and its assigned pattern category.
2. WHEN text is submitted for analysis, THE Tone_Analyzer SHALL detect sarcasm patterns (e.g., "Thanks for finally getting back to me", "No worries, I only waited a week") and return each detected phrase with its position in the original text and its assigned pattern category.
3. WHEN text is submitted for analysis, THE Tone_Analyzer SHALL detect escalation language patterns (e.g., "I'm looping in [manager]", "Just to clarify for everyone") and return each detected phrase with its position in the original text and its assigned pattern category.
4. WHEN text is submitted for analysis, THE Tone_Analyzer SHALL detect defensive phrasing patterns (e.g., "I'm not sure what you expected", "That's not my responsibility") and return each detected phrase with its position in the original text and its assigned pattern category.
5. WHEN text is submitted for analysis, THE Tone_Analyzer SHALL detect backhanded compliment patterns (e.g., "Great job, considering the circumstances") and return each detected phrase with its position in the original text and its assigned pattern category.
6. WHEN text is submitted for analysis and contains multiple passive-aggressive phrases, THE Tone_Analyzer SHALL identify and return each phrase independently with its own pattern category assignment.
7. IF text is submitted for analysis and no passive-aggressive patterns are detected, THEN THE Tone_Analyzer SHALL return an empty result set for detected patterns and assign a Tone_Score of 1.

### Requirement 3: Tone Scoring

**User Story:** As an employee, I want to see a clear tone score for my message, so that I can quickly assess how my communication may be perceived.

#### Acceptance Criteria

1. WHEN analysis is complete, THE Tone_Analyzer SHALL assign an integer Tone_Score on a scale of 1 (neutral) to 10 (highly passive-aggressive).
2. WHEN analysis is complete, THE Tone_Analyzer SHALL assign a Tone_Label based on the Tone_Score: "Neutral" for scores 1-2, "Mildly passive-aggressive" for scores 3-4, "Moderately passive-aggressive" for scores 5-6, "Passive-aggressive" for scores 7-8, and "Highly passive-aggressive" for scores 9-10.
3. WHEN a Tone_Score of 1-3 is assigned, THE Web_UI SHALL display the score with a green visual indicator.
4. WHEN a Tone_Score of 4-6 is assigned, THE Web_UI SHALL display the score with a yellow visual indicator.
5. WHEN a Tone_Score of 7-10 is assigned, THE Web_UI SHALL display the score with a red visual indicator.
6. WHEN analysis is complete, THE Web_UI SHALL display the numeric Tone_Score and the Tone_Label together with the corresponding color indicator.

### Requirement 4: Phrase Highlighting and Explanation

**User Story:** As an employee, I want problematic phrases highlighted with explanations, so that I understand exactly why specific language may be perceived negatively.

#### Acceptance Criteria

1. WHEN passive-aggressive patterns are detected, THE Phrase_Highlighter SHALL visually mark each flagged phrase within the original text.
2. WHEN a user selects a highlighted phrase, THE Web_UI SHALL display an explanation of why the phrase may be perceived as passive-aggressive, consisting of 20 to 200 characters in length.
3. WHEN a user selects a highlighted phrase, THE Web_UI SHALL display the specific pattern category the phrase belongs to (e.g., "indirect criticism", "sarcasm", "escalation language").
4. WHEN multiple phrases are flagged, THE Phrase_Highlighter SHALL highlight each phrase independently with its own explanation, up to a maximum of 20 highlighted phrases per analysis.
5. IF no passive-aggressive patterns are detected in the submitted text, THEN THE Web_UI SHALL display a message indicating that no problematic phrases were found.

### Requirement 5: Honest Interpretation

**User Story:** As an employee, I want to see how my message might be received by the reader, so that I can gauge the potential impact of my communication.

#### Acceptance Criteria

1. WHEN analysis is complete, THE Tone_Analyzer SHALL generate an Honest_Interpretation of 1 to 3 sentences describing how the recipient is likely to perceive the message.
2. THE Honest_Interpretation SHALL be written in plain language from the recipient's perspective (e.g., "The reader may feel you are blaming them for the delay").
3. WHEN the Tone_Score is 1-3, THE Tone_Analyzer SHALL indicate in the Honest_Interpretation that the message is likely to be received neutrally with no negative perception noted.
4. WHEN the Tone_Score is 4-6, THE Tone_Analyzer SHALL generate an Honest_Interpretation that references the specific passive-aggressive patterns detected and describes the moderate negative perception they may cause.
5. WHEN the Tone_Score is 7-10, THE Tone_Analyzer SHALL generate an Honest_Interpretation that references the specific passive-aggressive patterns detected and describes the strong negative perception or defensive reaction they are likely to provoke.

### Requirement 6: Risk Indicators

**User Story:** As an employee, I want to see risk indicators for potential negative outcomes, so that I can make informed decisions about sending my message.

#### Acceptance Criteria

1. WHEN analysis is complete, THE Tone_Analyzer SHALL display a Risk_Indicator for misinterpretation likelihood rated as Low (Tone_Score 1-3), Medium (Tone_Score 4-6), or High (Tone_Score 7-10).
2. WHEN analysis is complete, THE Tone_Analyzer SHALL display a Risk_Indicator for defensiveness likelihood rated as Low (0 defensive phrasing patterns detected), Medium (1-2 defensive phrasing patterns detected), or High (3 or more defensive phrasing patterns detected).
3. WHEN analysis is complete, THE Tone_Analyzer SHALL display a Risk_Indicator for escalation likelihood rated as Low (0 escalation language patterns detected), Medium (1 escalation language pattern detected), or High (2 or more escalation language patterns detected).
4. WHEN analysis is complete, THE Web_UI SHALL display all three Risk_Indicators simultaneously, each labeled with its category name and current rating.
5. WHEN any Risk_Indicator is rated High, THE Web_UI SHALL display a single non-blocking warning message recommending the user revise the message before sending.
6. IF multiple Risk_Indicators are rated High, THEN THE Web_UI SHALL list all High-rated risk categories within the single warning message.

### Requirement 7: Rewrite Suggestions

**User Story:** As an employee, I want rewrite suggestions generated using my selected Persona voice, so that I can choose a version that matches my intended communication style.

#### Acceptance Criteria

1. WHEN analysis detects a Tone_Score of 4 or higher, THE Rewrite_Generator SHALL generate between 1 and 3 rewrite suggestions using the currently active Persona within 3 seconds.
2. IF no Persona is explicitly selected, THEN THE Rewrite_Generator SHALL use the Default_Persona (AI-Professional) for generating rewrites.
3. WHEN a user selects a different Persona from the Persona dropdown, THE Rewrite_Generator SHALL regenerate rewrite suggestions using the selected Persona's voice and style.
4. THE Rewrite_Generator SHALL preserve all named entities, dates, deadlines, action items, and explicit requests present in the user's original message in all generated rewrites.
5. WHEN a rewrite is generated, THE Rewrite_Generator SHALL produce text that scores a Tone_Score of 3 or lower when re-analyzed.
6. IF the Rewrite_Generator fails to produce suggestions, THEN THE Web_UI SHALL display an error message indicating that rewrite generation is unavailable and offer a retry action.

### Requirement 8: Rewrite Selection and Editing

**User Story:** As an employee, I want to select, edit, and copy rewrite suggestions, so that I can customize the output and use it in my communications.

#### Acceptance Criteria

1. WHEN rewrite options are displayed, THE Web_UI SHALL allow the user to select one rewrite option for further editing.
2. WHEN a user selects a rewrite option, THE Web_UI SHALL display the selected text in an editable text field with a maximum length of 5000 characters.
3. WHEN a user selects a rewrite option, THE Web_UI SHALL provide a copy-to-clipboard action for the text content, regardless of whether the user has edited the text.
4. WHEN a user activates the copy action, THE Web_UI SHALL copy the current text content of the editable field to the system clipboard and display a confirmation message for at least 3 seconds.
5. IF the clipboard copy operation fails due to browser permissions or other system restrictions, THEN THE Web_UI SHALL display an error message indicating the copy failed and suggest the user manually select and copy the text.

### Requirement 9: Persona Management (CRUD)

**User Story:** As an employee, I want to create, view, edit, and delete custom Personas, so that I can maintain a library of voice options tailored to my communication needs.

#### Acceptance Criteria

1. THE Web_UI SHALL provide a Persona management interface accessible from the main navigation.
2. WHEN a user creates a new Persona, THE Web_UI SHALL require a Persona name between 1 and 50 characters in length and a Persona_Definition between 1 and 10000 characters in length.
3. WHEN a user saves a new Persona, THE Persona_Library SHALL persist the Persona and make it available in the Persona dropdown.
4. WHEN a user views the Persona_Library, THE Web_UI SHALL display all saved Personas with their names and the first 100 characters of their Persona_Definition as a preview.
5. WHEN a user edits an existing Persona, THE Web_UI SHALL allow modification of the Persona name and Persona_Definition within the same length constraints as creation (name: 1-50 characters, definition: 1-10000 characters).
6. WHEN a user deletes a Persona, THE Web_UI SHALL display a confirmation prompt before removing the Persona from the Persona_Library.
7. THE Web_UI SHALL prevent deletion of the Default_Persona (AI-Professional).
8. WHEN a user deletes the currently active Persona, THE Web_UI SHALL revert the active selection to the Default_Persona.
9. IF a user attempts to save a Persona with a name that is empty, exceeds 50 characters, or has a Persona_Definition that is empty or exceeds 10000 characters, THEN THE Web_UI SHALL display an error message indicating the specific validation failure and retain the user's input in the form.
10. IF a user attempts to save a Persona with a name that already exists in the Persona_Library, THEN THE Web_UI SHALL display an error message indicating the name must be unique and retain the user's input in the form.

### Requirement 10: Persona Import from File

**User Story:** As an employee, I want to import Persona definitions from files, so that I can quickly load pre-built voices shared by my team or organization.

#### Acceptance Criteria

1. THE Web_UI SHALL provide a file import action within the Persona management interface.
2. WHEN a user selects a file for import, THE Web_UI SHALL accept files in plain text (.txt) and JSON (.json) formats with a maximum file size of 500 KB.
3. WHEN a valid .txt file is imported, THE Persona_Library SHALL create a new Persona entry using the entire file content as the Persona_Definition, provided it contains between 1 and 10000 characters of non-empty text.
4. WHEN a valid .json file is imported, THE Persona_Library SHALL create a new Persona entry by extracting the Persona_Definition from a top-level "persona_definition" text field, provided the field contains between 1 and 10000 characters.
5. IF an imported file is in an unsupported format (not .txt or .json), THEN THE Web_UI SHALL display an error message indicating the accepted file formats.
6. IF an imported file exceeds 500 KB in size, THEN THE Web_UI SHALL display an error message indicating the maximum allowed file size.
7. IF an imported file contains empty content, or a .json file lacks the required "persona_definition" field, or the extracted Persona_Definition exceeds 10000 characters, THEN THE Web_UI SHALL display an error message describing the specific validation failure.
8. WHEN a Persona is successfully imported, THE Web_UI SHALL navigate the user to the edit view of the new Persona for review and name assignment.

### Requirement 11: Persona Copy-Paste Creation

**User Story:** As an employee, I want to create a Persona by pasting text content directly, so that I can quickly add voice definitions without needing to create a file first.

#### Acceptance Criteria

1. THE Web_UI SHALL provide a paste-based creation option within the Persona management interface.
2. WHEN a user pastes Persona_Definition text into the creation field, THE Web_UI SHALL accept multi-line text content between 1 and 10000 non-whitespace-trimmed characters in length.
3. WHEN a user submits pasted content with a Persona name between 1 and 100 characters, THE Persona_Library SHALL create a new Persona entry with the pasted Persona_Definition and display a confirmation message indicating successful creation.
4. IF the pasted content exceeds 10000 characters, THEN THE Web_UI SHALL display an error message indicating the maximum character limit for Persona definitions.
5. IF the pasted content is empty or contains only whitespace characters, THEN THE Web_UI SHALL disable the save action and display a prompt to enter Persona content.
6. IF a user submits a Persona name that already exists in the Persona_Library, THEN THE Web_UI SHALL display an error message indicating the name is already in use and prevent creation until a unique name is provided.
7. IF the Persona name is empty, contains only whitespace, or exceeds 100 characters, THEN THE Web_UI SHALL display an error message indicating the name must be between 1 and 100 characters.

### Requirement 12: Persona Selection and Default Behavior

**User Story:** As an employee, I want to quickly switch between Personas using a dropdown, so that I can try different voices for my rewrite suggestions without navigating away from the analysis view.

#### Acceptance Criteria

1. THE Web_UI SHALL display a Persona selection dropdown on the analysis results view.
2. IF no Persona has been explicitly selected during the current Analysis_Session, THEN THE Web_UI SHALL pre-select the Default_Persona (AI-Professional) in the dropdown.
3. WHEN a user selects a Persona from the dropdown, THE Rewrite_Generator SHALL regenerate suggestions using the newly selected Persona within 2 seconds.
4. THE Web_UI SHALL display the currently active Persona name alongside the rewrite suggestions.
5. WHILE the Persona_Library contains custom Personas, THE Web_UI SHALL list all available Personas in the dropdown sorted alphabetically with the Default_Persona listed first.
6. IF the Persona_Library contains no custom Personas, THEN THE Web_UI SHALL display only the Default_Persona in the dropdown.
7. WHILE the Rewrite_Generator is regenerating suggestions after a Persona switch, THE Web_UI SHALL display a loading indicator in the rewrite suggestions area.
8. IF the Rewrite_Generator fails to regenerate suggestions after a Persona selection change, THEN THE Web_UI SHALL display an error message indicating the regeneration failed and offer a retry action while preserving the previously displayed suggestions.

### Requirement 13: Privacy and Data Handling

**User Story:** As an employee, I want assurance that my message content is not stored without my consent, so that I can use the tool without concerns about data retention.

#### Acceptance Criteria

1. THE Tone_Analyzer SHALL process all text analysis within the active Analysis_Session without persisting user-entered content to the local database by default.
2. WHEN an Analysis_Session ends (browser tab closed or page navigated away), THE Web_UI SHALL immediately discard all user-entered text and analysis results from application memory unless the user has opted in to saving history.
3. THE Web_UI SHALL display a privacy notice on the analysis view, visible before the user enters any text, informing the user that content is not stored by default.
4. IF a user explicitly opts in to saving analysis history via a clearly labeled consent toggle, THEN THE Web_UI SHALL persist the user's original text, Tone_Score, Tone_Label, and generated rewrites to the local SQLite database.
5. THE Tone_Analyzer SHALL transmit user-entered text to the AI provider only over encrypted connections (HTTPS/TLS). All other data SHALL remain local to the user's machine.
6. IF a user opts out of saving analysis history or requests deletion, THEN THE application SHALL remove all previously saved analysis results from the local database within 5 seconds and display a confirmation message.
7. WHEN the consent toggle is set to off, THE application SHALL stop persisting new analysis results and SHALL not delete previously saved results unless the user explicitly requests deletion.
8. THE local database file SHALL be excluded from version control by default (gitignored) so that user data is never accidentally committed to a repository.

### Requirement 14: Performance

**User Story:** As an employee, I want analysis results returned quickly, so that the tool does not interrupt my workflow.

#### Acceptance Criteria

1. WHEN text of 2000 characters or fewer is submitted, THE Tone_Analyzer SHALL return complete analysis results rendered in the Web_UI within 1 second measured from the moment the user initiates the analysis action.
2. WHEN text between 2001 and 5000 characters is submitted, THE Tone_Analyzer SHALL return complete analysis results rendered in the Web_UI within 2 seconds measured from the moment the user initiates the analysis action.
3. WHILE analysis is in progress, THE Web_UI SHALL display a loading indicator within 200 milliseconds of the user initiating the analysis action and remove the loading indicator when results are displayed or an error is shown.
4. IF analysis fails to complete within 5 seconds, THEN THE Web_UI SHALL remove the loading indicator, display a timeout error message, and offer a retry action that re-submits the same text for analysis.
5. THE application SHALL operate as a single-user local tool with no concurrency requirements beyond the host machine's capacity.

### Requirement 15: Accessibility

**User Story:** As an employee using assistive technology, I want the tool to be fully accessible, so that I can use all features regardless of ability.

#### Acceptance Criteria

1. THE Web_UI SHALL conform to WCAG 2.1 Level AA accessibility standards for all interactive elements.
2. WHEN phrases are highlighted, THE Phrase_Highlighter SHALL convey the highlighting through both color and a non-color indicator (e.g., underline, icon) to support color-blind users.
3. THE Web_UI SHALL support keyboard navigation with a visible focus indicator and logical tab order for all interactive elements including text input, result navigation, rewrite selection, and copy actions, such that every action achievable by mouse is also achievable by keyboard alone.
4. WHEN tone scores and risk indicators are displayed, THE Web_UI SHALL provide a visible text label (e.g., "Low", "Medium", "High" for risk; the numeric score and Tone_Label for tone) adjacent to each color-coded indicator so that information is not conveyed by color alone.
5. WHEN analysis results, rewrite suggestions, or error messages are dynamically added to the page, THE Web_UI SHALL announce the new content to screen readers using ARIA live regions within 1 second of display.
6. WHEN a highlighted phrase is selected or analysis results appear, THE Web_UI SHALL move keyboard focus to the newly displayed content so that keyboard and screen reader users can immediately interact with it.

### Requirement 16: Error Handling

**User Story:** As an employee, I want clear error messages when something goes wrong, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. IF the Tone_Analyzer service is unavailable, THEN THE Web_UI SHALL display a message indicating the service is temporarily unavailable and offer a retry action.
2. IF a network error occurs during analysis submission, THEN THE Web_UI SHALL display a connectivity error message and offer a retry action that resubmits the original text for analysis.
3. IF the Tone_Analyzer returns an unexpected response format, THEN THE Web_UI SHALL display a generic error message and log the error for diagnostics without exposing internal details to the user.
4. IF any error occurs during analysis submission, THEN THE Web_UI SHALL preserve the user's entered text in the input field so that the user can retry or edit without re-entering content.

### Requirement 17: Translation Modes

**User Story:** As an employee, I want access to multiple translation modes beyond rewrites, so that I can decode, amplify, de-escalate, or humorously interpret messages depending on my needs.

#### Translation Modes

**"Decode It"** — Reveals the true meaning behind corporate speak.

Examples:
- "Per my last email..." → "You clearly didn't read what I sent. I'm documenting this."
- "As previously discussed..." → "I cannot believe I have to say this again."
- "Going forward..." → "You messed up and this is your formal warning."

**"Ramp It Up"** — Takes a normal email and makes it drip with passive aggression.

**"Cool It Down"** — Takes a spicy draft you wrote in anger and sanitizes it into something you can actually send.

**"Nuclear Option"** — Translates it into full, unfiltered honesty (for entertainment purposes only 😅).

#### Acceptance Criteria

1. THE Web_UI SHALL provide a mode selector with four translation modes: "Decode It", "Ramp It Up", "Cool It Down", and "Nuclear Option".
2. WHEN a user selects "Decode It", THE Tone_Analyzer SHALL interpret each sentence or phrase in the submitted text and produce a plain-language translation revealing the likely intended subtext.
3. WHEN a user selects "Ramp It Up", THE Rewrite_Generator SHALL take neutral or professional input text and produce a rewrite that introduces passive-aggressive phrasing while preserving the original message content.
4. WHEN a user selects "Cool It Down", THE Rewrite_Generator SHALL take emotionally charged or aggressive input text and produce a professional, send-safe rewrite that preserves all action items and requests.
5. WHEN a user selects "Nuclear Option", THE Rewrite_Generator SHALL produce an unfiltered, brutally honest interpretation of the submitted text intended for humor and self-awareness, not for sending.
6. WHEN the "Nuclear Option" mode is active, THE Web_UI SHALL display a persistent disclaimer indicating the output is for entertainment purposes only and should not be sent.
7. THE Web_UI SHALL allow users to switch between translation modes without re-entering their original text.
8. WHEN a translation mode is selected, THE Rewrite_Generator SHALL return results within 3 seconds using the currently active Persona voice.
