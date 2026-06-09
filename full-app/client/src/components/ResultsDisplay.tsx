import { useState } from 'react';

interface Props {
  result: any;
  mode: string;
}

function ToneBar({ score }: { score: number }) {
  const color = score <= 3 ? 'bg-green-500' : score <= 6 ? 'bg-yellow-500' : 'bg-red-500';
  const label = score <= 3 ? 'Low' : score <= 6 ? 'Medium' : 'High';
  return (
    <div className="w-full">
      <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden" role="progressbar" aria-valuenow={score} aria-valuemin={1} aria-valuemax={10} aria-label={`Tone score: ${score} out of 10 (${label})`}>
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${score * 10}%` }} />
      </div>
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback: select text for manual copy
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-sm text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 transition-colors"
      aria-label={label || 'Copy to clipboard'}
    >
      {copied ? '✅ Copied!' : '📋 Copy'}
    </button>
  );
}

export default function ResultsDisplay({ result, mode }: Props) {
  const [selectedRewrite, setSelectedRewrite] = useState<number | null>(null);
  const [editedRewrite, setEditedRewrite] = useState('');

  const handleSelectRewrite = (index: number, text: string) => {
    setSelectedRewrite(index);
    setEditedRewrite(text);
  };

  return (
    <div className="space-y-6">
      {/* Tone Score */}
      {result.toneScore && (
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Tone Score</h2>
            <span className="text-2xl font-bold" aria-hidden="true">{result.toneScore}/10</span>
          </div>
          <ToneBar score={result.toneScore} />
          <p className="text-gray-400 mt-2 text-sm">
            <span className="underline decoration-dotted">{result.toneLabel}</span> • Voice: {result.personaUsed}
          </p>
        </div>
      )}

      {/* Risk Indicators */}
      {result.riskIndicators && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">Risk Indicators</h2>
          <div className="grid grid-cols-3 gap-4" role="list" aria-label="Risk indicators">
            {Object.entries(result.riskIndicators).map(([key, value]) => (
              <div key={key} className="text-center" role="listitem">
                <div className={`text-xl font-bold ${value === 'High' ? 'text-red-400' : value === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {value as string}
                </div>
                <div className="text-xs text-gray-400 capitalize">{key}</div>
              </div>
            ))}
          </div>
          {/* Warning when any risk is High */}
          {Object.values(result.riskIndicators).includes('High') && (
            <div className="mt-4 bg-red-900/30 border border-red-800 rounded-lg p-3" role="alert">
              <p className="text-red-300 text-sm">
                ⚠️ High risk detected in: {Object.entries(result.riskIndicators)
                  .filter(([_, v]) => v === 'High')
                  .map(([k]) => k)
                  .join(', ')}. Consider revising before sending.
              </p>
            </div>
          )}
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
          <div className="space-y-3" role="list" aria-label="Detected passive-aggressive patterns">
            {result.patterns.map((p: any, i: number) => (
              <div key={i} className="bg-gray-900 rounded-lg p-3" role="listitem">
                <div className="flex justify-between flex-wrap gap-2">
                  <span className="text-yellow-300 font-medium underline decoration-yellow-500/50">"{p.phrase}"</span>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">{p.category}</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{p.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No patterns detected */}
      {result.patterns && result.patterns.length === 0 && mode === 'analyze' && (
        <div className="bg-gray-800 rounded-xl p-6">
          <p className="text-green-400">✅ No passive-aggressive patterns detected. Your message looks clear and professional.</p>
        </div>
      )}

      {/* Rewrites (Analyze mode) */}
      {result.rewrites && result.rewrites.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">✨ Suggested Rewrites ({result.personaUsed})</h2>
          <div className="space-y-3" role="radiogroup" aria-label="Rewrite suggestions">
            {result.rewrites.map((r: string, i: number) => (
              <div key={i} className="bg-gray-900 rounded-lg p-4 group relative">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="rewrite"
                    checked={selectedRewrite === i}
                    onChange={() => handleSelectRewrite(i, r)}
                    className="mt-1 w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500"
                    aria-label={`Rewrite option ${i + 1}`}
                  />
                  <p className="text-gray-200">{r}</p>
                </label>
                <div className="absolute top-2 right-2">
                  <CopyButton text={r} label={`Copy rewrite ${i + 1}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Editable field for selected rewrite */}
          {selectedRewrite !== null && (
            <div className="mt-4">
              <label htmlFor="edit-rewrite" className="text-sm text-gray-400 mb-1 block">Edit selected rewrite:</label>
              <textarea
                id="edit-rewrite"
                value={editedRewrite}
                onChange={(e) => setEditedRewrite(e.target.value)}
                maxLength={5000}
                className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">{editedRewrite.length}/5000</span>
                <CopyButton text={editedRewrite} label="Copy edited rewrite" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Decoded (Decode mode) */}
      {result.decoded && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">🕵️ What They Actually Mean</h2>
          <div className="space-y-3" role="list" aria-label="Decoded translations">
            {result.decoded.map((d: any, i: number) => (
              <div key={i} className="bg-gray-900 rounded-lg p-3" role="listitem">
                <p className="text-gray-400 text-sm line-through">{d.original}</p>
                <p className="text-yellow-300 mt-1 font-medium">→ {d.translation}</p>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <CopyButton
              text={result.decoded.map((d: any) => `"${d.original}" → ${d.translation}`).join('\n')}
              label="Copy all decoded translations"
            />
          </div>
        </div>
      )}

      {/* Ramped Up */}
      {result.ramped && (
        <div className="bg-gray-800 rounded-xl p-6 border border-orange-800">
          <h2 className="text-lg font-semibold mb-3">🔥 Passive-Aggressive Version</h2>
          <p className="text-orange-200 whitespace-pre-wrap">{result.ramped}</p>
          {result.techniques && (
            <div className="mt-3 flex flex-wrap gap-1" role="list" aria-label="Techniques used">
              {result.techniques.map((t: string, i: number) => (
                <span key={i} className="text-xs bg-orange-900/50 text-orange-300 px-2 py-1 rounded" role="listitem">{t}</span>
              ))}
            </div>
          )}
          <div className="mt-3">
            <CopyButton text={result.ramped} label="Copy ramped up version" />
          </div>
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
              <div className="flex flex-wrap gap-1" role="list" aria-label="Preserved items">
                {result.preserved.map((p: string, i: number) => (
                  <span key={i} className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded" role="listitem">✓ {p}</span>
                ))}
              </div>
            </div>
          )}
          {result.removed && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Removed:</p>
              <div className="flex flex-wrap gap-1" role="list" aria-label="Removed items">
                {result.removed.map((r: string, i: number) => (
                  <span key={i} className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded" role="listitem">✗ {r}</span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-3">
            <CopyButton text={result.cooled} label="Copy de-escalated version" />
          </div>
        </div>
      )}

      {/* Nuclear */}
      {result.nuclear && (
        <div className="bg-gray-800 rounded-xl p-6 border border-red-800">
          <div className="bg-red-900/30 rounded-lg p-3 mb-4 text-center" role="alert">
            <p className="text-red-300 text-sm font-medium">⚠️ FOR ENTERTAINMENT ONLY — DO NOT SEND ⚠️</p>
          </div>
          <h2 className="text-lg font-semibold mb-3">☢️ The Nuclear Option</h2>
          <p className="text-red-200 whitespace-pre-wrap text-lg">{result.nuclear}</p>
          {result.disclaimer && (
            <p className="text-gray-500 text-sm mt-4 italic">{result.disclaimer}</p>
          )}
        </div>
      )}
    </div>
  );
}
