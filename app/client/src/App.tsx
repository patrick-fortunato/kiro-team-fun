import { useState } from 'react';

const PERSONAS = [
  { id: 'default-professional', name: 'AI-Professional' },
  { id: 'audrey', name: 'Audrey' },
  { id: 'patrick', name: 'Patrick' },
  { id: 'ixshel', name: 'Ixshel' },
  { id: 'katie', name: 'Katie' },
  { id: 'landan', name: 'Landan' },
  { id: 'josh', name: 'Josh' },
  { id: 'manoj', name: 'Manoj' },
  { id: 'manuel', name: 'Manuel' },
];

const MODES = [
  { id: 'analyze', label: '🔍 Analyze', color: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'decode', label: '🕵️ Decode It', color: 'bg-purple-600 hover:bg-purple-700' },
  { id: 'ramp_up', label: '🔥 Ramp It Up', color: 'bg-orange-600 hover:bg-orange-700' },
  { id: 'cool_down', label: '❄️ Cool It Down', color: 'bg-cyan-600 hover:bg-cyan-700' },
  { id: 'nuclear', label: '☢️ Nuclear Option', color: 'bg-red-600 hover:bg-red-700' },
];

function ToneBar({ score }: { score: number }) {
  const color = score <= 3 ? 'bg-green-500' : score <= 6 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${score * 10}%` }} />
    </div>
  );
}

function App() {
  const [text, setText] = useState('');
  const [persona, setPersona] = useState('default-professional');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeMode, setActiveMode] = useState('');

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
        body: JSON.stringify({ text, mode, personaId: persona }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            📧 Passive-Aggressive Email Translator
          </h1>
          <p className="text-gray-400">Decode corporate speak. De-escalate drama. Or go nuclear.</p>
        </div>

        {/* Input Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-300">Your message:</label>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-400">Voice:</label>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                className="bg-gray-700 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-600 focus:border-blue-500 outline-none"
              >
                {PERSONAS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your email here... e.g. 'Per my last email, I wanted to follow up on the deliverable that was due last week. As previously discussed, this is a priority item. Going forward, please loop me in on all updates.'"
            className="w-full h-40 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 resize-none focus:border-blue-500 outline-none"
            maxLength={5000}
          />

          <div className="flex justify-between items-center mt-2">
            <span className={`text-xs ${text.length > 4800 ? 'text-red-400' : 'text-gray-500'}`}>
              {text.length}/5000
            </span>
          </div>

          {/* Mode Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => analyze(mode.id)}
                disabled={loading || !text.trim()}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${mode.color} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-400 mt-3">Analyzing with {PERSONAS.find(p => p.id === persona)?.name}'s voice...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 mb-6">
            <p className="text-red-300">{error}</p>
            <button onClick={() => analyze(activeMode)} className="text-red-400 underline text-sm mt-2">Retry</button>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">
            {/* Tone Score */}
            {result.toneScore && (
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Tone Score</h2>
                  <span className="text-2xl font-bold">{result.toneScore}/10</span>
                </div>
                <ToneBar score={result.toneScore} />
                <p className="text-gray-400 mt-2 text-sm">
                  {result.toneLabel} • Voice: {result.personaUsed}
                </p>
              </div>
            )}

            {/* Risk Indicators */}
            {result.riskIndicators && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-3">Risk Indicators</h2>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(result.riskIndicators).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className={`text-xl font-bold ${value === 'High' ? 'text-red-400' : value === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                        {value as string}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Honest Interpretation */}
            {result.honestInterpretation && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-2">💭 Honest Interpretation</h2>
                <p className="text-gray-300 italic">"{result.honestInterpretation}"</p>
              </div>
            )}

            {/* Patterns (Analyze mode) */}
            {result.patterns && result.patterns.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-3">🚩 Detected Patterns</h2>
                <div className="space-y-3">
                  {result.patterns.map((p: any, i: number) => (
                    <div key={i} className="bg-gray-900 rounded-lg p-3">
                      <div className="flex justify-between">
                        <span className="text-yellow-300 font-medium">"{p.phrase}"</span>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">{p.category}</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{p.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rewrites (Analyze mode) */}
            {result.rewrites && result.rewrites.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-3">✨ Suggested Rewrites</h2>
                <div className="space-y-3">
                  {result.rewrites.map((r: string, i: number) => (
                    <div key={i} className="bg-gray-900 rounded-lg p-4 group relative">
                      <p className="text-gray-200">{r}</p>
                      <button
                        onClick={() => copyToClipboard(r)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy"
                      >
                        📋
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Decoded (Decode mode) */}
            {result.decoded && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-3">🕵️ What They Actually Mean</h2>
                <div className="space-y-3">
                  {result.decoded.map((d: any, i: number) => (
                    <div key={i} className="bg-gray-900 rounded-lg p-3">
                      <p className="text-gray-400 text-sm line-through">{d.original}</p>
                      <p className="text-yellow-300 mt-1 font-medium">→ {d.translation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ramped Up */}
            {result.ramped && (
              <div className="bg-gray-800 rounded-xl p-6 border border-orange-800">
                <h2 className="text-lg font-semibold mb-3">🔥 Passive-Aggressive Version</h2>
                <p className="text-orange-200 whitespace-pre-wrap">{result.ramped}</p>
                {result.techniques && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {result.techniques.map((t: string, i: number) => (
                      <span key={i} className="text-xs bg-orange-900/50 text-orange-300 px-2 py-1 rounded">{t}</span>
                    ))}
                  </div>
                )}
                <button onClick={() => copyToClipboard(result.ramped)} className="mt-3 text-sm text-gray-400 hover:text-white">📋 Copy</button>
              </div>
            )}

            {/* Cooled Down */}
            {result.cooled && (
              <div className="bg-gray-800 rounded-xl p-6 border border-cyan-800">
                <h2 className="text-lg font-semibold mb-3">❄️ De-escalated Version</h2>
                <p className="text-cyan-200 whitespace-pre-wrap">{result.cooled}</p>
                {result.preserved && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-1">Preserved:</p>
                    <div className="flex flex-wrap gap-1">
                      {result.preserved.map((p: string, i: number) => (
                        <span key={i} className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded">✓ {p}</span>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={() => copyToClipboard(result.cooled)} className="mt-3 text-sm text-gray-400 hover:text-white">📋 Copy</button>
              </div>
            )}

            {/* Nuclear */}
            {result.nuclear && (
              <div className="bg-gray-800 rounded-xl p-6 border border-red-800">
                <div className="bg-red-900/30 rounded-lg p-3 mb-4 text-center">
                  <p className="text-red-300 text-sm">⚠️ FOR ENTERTAINMENT ONLY — DO NOT SEND ⚠️</p>
                </div>
                <h2 className="text-lg font-semibold mb-3">☢️ The Nuclear Option</h2>
                <p className="text-red-200 whitespace-pre-wrap text-lg">{result.nuclear}</p>
                {result.disclaimer && (
                  <p className="text-gray-500 text-sm mt-4 italic">{result.disclaimer}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
