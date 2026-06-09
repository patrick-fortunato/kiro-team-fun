import { useState, useRef, useEffect } from 'react';
import type { PersonaItem } from '../App';
import ResultsDisplay from './ResultsDisplay';

const MODES = [
  { id: 'analyze', label: '🔍 Analyze', color: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' },
  { id: 'decode', label: '🕵️ Decode It', color: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' },
  { id: 'ramp_up', label: '🔥 Ramp It Up', color: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500' },
  { id: 'cool_down', label: '❄️ Cool It Down', color: 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500' },
  { id: 'nuclear', label: '☢️ Nuclear Option', color: 'bg-red-600 hover:bg-red-700 focus:ring-red-500' },
];

interface Props {
  personas: PersonaItem[];
  activePersona: string;
  onPersonaChange: (id: string) => void;
}

export default function AnalysisView({ personas, activePersona, onPersonaChange }: Props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeMode, setActiveMode] = useState('');
  const [historyEnabled, setHistoryEnabled] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch preferences
    fetch('/api/preferences')
      .then(res => res.json())
      .then(data => {
        setHistoryEnabled(data.history_enabled === 'true');
      })
      .catch(() => {});
  }, []);

  const toggleHistory = async () => {
    const newValue = !historyEnabled;
    setHistoryEnabled(newValue);
    try {
      await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'history_enabled', value: String(newValue) }),
      });
    } catch {
      // Revert on error
      setHistoryEnabled(!newValue);
    }
  };

  const deleteHistory = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' });
    } catch {
      // silent
    }
  };

  const analyze = async (mode: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setActiveMode(mode);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode, personaId: activePersona }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await res.json();
      setResult(data);

      // Move focus to results for accessibility
      setTimeout(() => {
        resultsRef.current?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Privacy Notice */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-6 text-sm text-gray-400" role="note" aria-label="Privacy notice">
        🔒 Your text is processed locally and not stored by default. Toggle history below to opt in to saving results.
      </div>

      {/* Input Section */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
          <label htmlFor="text-input" className="text-sm font-medium text-gray-300">
            Your message:
          </label>
          <div className="flex items-center gap-3">
            <label htmlFor="persona-select" className="text-sm text-gray-400">Voice:</label>
            <select
              id="persona-select"
              value={activePersona}
              onChange={(e) => onPersonaChange(e.target.value)}
              className="bg-gray-700 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              aria-label="Select persona voice"
            >
              {personas.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your email here... e.g. 'Per my last email, I wanted to follow up on the deliverable that was due last week. As previously discussed, this is a priority item. Going forward, please loop me in on all updates.'"
          className="w-full h-40 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          maxLength={5000}
          aria-describedby="char-count"
        />

        <div className="flex justify-between items-center mt-2">
          <span
            id="char-count"
            className={`text-xs ${text.length > 4800 ? 'text-red-400' : 'text-gray-500'}`}
            aria-live="polite"
          >
            {text.length}/5000
          </span>
          {text.length > 5000 && (
            <span className="text-xs text-red-400" role="alert">
              Maximum character limit exceeded
            </span>
          )}
        </div>

        {/* Mode Buttons */}
        <div className="flex flex-wrap gap-2 mt-4" role="group" aria-label="Translation modes">
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => analyze(mode.id)}
              disabled={loading || !text.trim()}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all focus:outline-none focus:ring-2 ${mode.color} disabled:opacity-40 disabled:cursor-not-allowed`}
              aria-label={`${mode.label} mode`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* History Toggle */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400">
            <input
              type="checkbox"
              checked={historyEnabled}
              onChange={toggleHistory}
              className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
            />
            Save analysis history
          </label>
          {historyEnabled && (
            <button
              onClick={deleteHistory}
              className="text-xs text-red-400 hover:text-red-300 underline"
            >
              Delete all history
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12" role="status" aria-live="polite">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-400 mt-3">
            Analyzing with {personas.find(p => p.id === activePersona)?.name || 'AI-Professional'}'s voice...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 mb-6" role="alert" aria-live="assertive">
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => analyze(activeMode)}
            className="text-red-400 underline text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
          >
            Retry
          </button>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div ref={resultsRef} tabIndex={-1} aria-live="polite" aria-label="Analysis results">
          <ResultsDisplay result={result} mode={activeMode} />
        </div>
      )}
    </div>
  );
}
