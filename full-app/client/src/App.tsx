import { useState, useEffect } from 'react';
import AnalysisView from './components/AnalysisView';
import PersonaManager from './components/PersonaManager';

export interface PersonaItem {
  id: string;
  name: string;
  preview: string;
  definition: string;
  isDefault: boolean;
}

function App() {
  const [view, setView] = useState<'analysis' | 'personas'>('analysis');
  const [personas, setPersonas] = useState<PersonaItem[]>([]);
  const [activePersona, setActivePersona] = useState<string>('default-professional');

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      const res = await fetch('/api/personas');
      if (res.ok) {
        const data = await res.json();
        setPersonas(data);
      }
    } catch {
      // Will use fallback
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700" role="navigation" aria-label="Main navigation">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">📧 PA Email Translator</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView('analysis')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'analysis' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              aria-current={view === 'analysis' ? 'page' : undefined}
            >
              Analyze
            </button>
            <button
              onClick={() => setView('personas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'personas' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              aria-current={view === 'personas' ? 'page' : undefined}
            >
              Personas
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {view === 'analysis' ? (
          <AnalysisView
            personas={personas}
            activePersona={activePersona}
            onPersonaChange={setActivePersona}
          />
        ) : (
          <PersonaManager
            personas={personas}
            onRefresh={fetchPersonas}
          />
        )}
      </main>
    </div>
  );
}

export default App;
