import React, { useState } from 'react';
import { Task } from '../types';

interface ImportTasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (tasks: Task[]) => void;
}

const ImportTasksDialog: React.FC<ImportTasksDialogProps> = ({ isOpen, onClose, onImport }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    try {
      // Parse the JSON input
      const parsedData = JSON.parse(jsonInput);
      
      // Validate that it's an array
      if (!Array.isArray(parsedData)) {
        setError('Il formato non è valido. È necessario un array di task.');
        return;
      }

      // Map the imported data to Task objects
      const importedTasks: Task[] = parsedData.map((item: any, index: number) => {
        // Generate a temporary ID for each task
        const tempId = `task-import-${Date.now()}-${index}`;
        
        // Map the imported data to a Task object
        return {
          id: tempId,
          content: item.content || 'Task senza contenuto',
          columnId: item.columnId || 'todo', // Default to 'todo' if not specified
          laneId: '', // Default to empty string, will be assigned in the parent component
          priority: item.priority as 'low' | 'medium' | 'high' || 'low',
          tags: item.tags || [],
          dueDate: item.dueDate || undefined,
          color: item.color || undefined,
        };
      });

      // Call the onImport callback with the imported tasks
      onImport(importedTasks);
      
      // Clear the input and close the dialog
      setJsonInput('');
      setError(null);
      onClose();
    } catch (err) {
      setError('Errore nel parsing del JSON. Verifica il formato.');
      console.error('JSON parse error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Importa Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Incolla i dati JSON nel formato seguente:
          </p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
{`[
  {
    "content": "Contenuto del task",
    "columnId": "todo",
    "priority": "low",
    "tags": ["tag1", "tag2"],
    "dueDate": "2024-05-02",
    "color": "#15D799"
  },
  ...
]`}
          </pre>
        </div>

        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Incolla qui i dati JSON..."
          className="w-full h-64 p-3 border border-gray-300 rounded resize-none mb-4 font-mono text-sm"
        />

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
          >
            Annulla
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Importa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportTasksDialog;