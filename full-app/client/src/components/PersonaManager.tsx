import { useState } from 'react';
import type { PersonaItem } from '../App';

interface Props {
  personas: PersonaItem[];
  onRefresh: () => void;
}

export default function PersonaManager({ personas, onRefresh }: Props) {
  const [editingPersona, setEditingPersona] = useState<PersonaItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [definition, setDefinition] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [importMode, setImportMode] = useState(false);

  const resetForm = () => {
    setName('');
    setDefinition('');
    setError('');
    setSuccess('');
    setEditingPersona(null);
    setIsCreating(false);
    setImportMode(false);
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const startEdit = (persona: PersonaItem) => {
    resetForm();
    setEditingPersona(persona);
    setName(persona.name);
    setDefinition(persona.definition);
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (name.length > 50) {
      setError('Name must be 50 characters or fewer');
      return;
    }
    if (!definition.trim()) {
      setError('Definition is required');
      return;
    }
    if (definition.length > 10000) {
      setError('Definition must be 10000 characters or fewer');
      return;
    }

    try {
      const url = editingPersona
        ? `/api/personas/${editingPersona.id}`
        : '/api/personas';
      const method = editingPersona ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), definition: definition.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save persona');
        return;
      }

      setSuccess(editingPersona ? 'Persona updated successfully' : 'Persona created successfully');
      onRefresh();
      setTimeout(() => {
        resetForm();
      }, 1500);
    } catch {
      setError('Network error. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/personas/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete persona');
        return;
      }
      setDeleteConfirm(null);
      onRefresh();
      setSuccess('Persona deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Network error. Please try again.');
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['txt', 'json'].includes(ext)) {
      setError('Only .txt and .json files are supported');
      return;
    }
    if (file.size > 500 * 1024) {
      setError('File must be 500KB or smaller');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/personas/import', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Import failed');
        return;
      }

      const persona = await res.json();
      setSuccess(`Imported "${persona.name}" successfully`);
      onRefresh();

      // Navigate to edit for review
      setTimeout(() => {
        startEdit(persona);
      }, 1500);
    } catch {
      setError('Network error during import');
    }

    // Reset file input
    e.target.value = '';
  };

  // Form view (create/edit)
  if (isCreating || editingPersona) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingPersona ? `Edit: ${editingPersona.name}` : 'Create New Persona'}
        </h2>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 mb-4" role="alert">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-900/50 border border-green-700 rounded-lg p-3 mb-4" role="status">
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="persona-name" className="block text-sm font-medium text-gray-300 mb-1">
              Name (1-50 characters)
            </label>
            <input
              id="persona-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="e.g. Friendly Manager"
            />
            <span className="text-xs text-gray-500">{name.length}/50</span>
          </div>

          <div>
            <label htmlFor="persona-definition" className="block text-sm font-medium text-gray-300 mb-1">
              Definition (1-10000 characters)
            </label>
            <textarea
              id="persona-definition"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              maxLength={10000}
              rows={10}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white resize-y focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Describe the persona's voice, style, and communication approach..."
            />
            <span className="text-xs text-gray-500">{definition.length}/10000</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!name.trim() || !definition.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {editingPersona ? 'Update Persona' : 'Create Persona'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h2 className="text-xl font-semibold">Persona Library</h2>
        <div className="flex gap-2">
          <button
            onClick={startCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Create New
          </button>
          <label className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-sm cursor-pointer focus-within:ring-2 focus-within:ring-green-500">
            📁 Import File
            <input
              type="file"
              accept=".txt,.json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 mb-4" role="alert">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-900/50 border border-green-700 rounded-lg p-3 mb-4" role="status" aria-live="polite">
          <p className="text-green-300 text-sm">{success}</p>
        </div>
      )}

      <div className="space-y-3" role="list" aria-label="Personas">
        {personas.map(persona => (
          <div
            key={persona.id}
            className="bg-gray-800 rounded-xl p-4 flex flex-wrap justify-between items-start gap-3"
            role="listitem"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-white">{persona.name}</h3>
                {persona.isDefault && (
                  <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">Default</span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1 truncate">{persona.preview}...</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(persona)}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Edit
              </button>
              {!persona.isDefault && (
                <>
                  {deleteConfirm === persona.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(persona.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(persona.id)}
                      className="px-3 py-1.5 bg-red-900/50 hover:bg-red-800 text-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {personas.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No personas found. Create one or import from a file.</p>
        </div>
      )}
    </div>
  );
}
