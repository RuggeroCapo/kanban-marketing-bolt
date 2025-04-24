import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Task } from '../types';

interface EditTaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onDelete?: (taskId: string) => void; // Optional delete handler
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({ task, isOpen, onClose, onSave, onDelete }) => {
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>(undefined);
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState(''); // Comma-separated string for simplicity
  const [color, setColor] = useState(''); // Hex color for task background

  useEffect(() => {
    if (task) {
      setContent(task.content);
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
      setTags(task.tags ? task.tags.join(', ') : '');
      setColor(task.color || '');
    } else {
      // Reset form when task is null (dialog closed or no task selected)
      setContent('');
      setPriority(undefined);
      setDueDate('');
      setTags('');
      setColor('');
    }
  }, [task]); // Re-run effect when the task prop changes

  const handleSave = () => {
    if (!task) return;

    const updatedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''); // Basic tag parsing

    const updatedTask: Task = {
      ...task,
      content: content.trim(),
      priority: priority,
      dueDate: dueDate || undefined, // Store as undefined if empty
      tags: updatedTags.length > 0 ? updatedTags : undefined, // Store as undefined if no tags
      color: color || undefined // Store as undefined if no color selected
    };
    onSave(updatedTask);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save on Ctrl+Enter or Command+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  // Prevent closing dialog when clicking inside content
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow z-40" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[90vw] max-w-md data-[state=open]:animate-contentShow z-50 border border-gray-200"
          onClick={handleContentClick}
          onEscapeKeyDown={onClose}
          onPointerDownOutside={onClose}
          onKeyDown={handleKeyDown}
          aria-labelledby="task-dialog-title"
          aria-describedby="task-dialog-description"
        >
          <Dialog.Title className="text-xl font-bold mb-1 text-gray-800 flex items-center">
            <div className="w-1.5 h-6 rounded-sm bg-blue-500 mr-2"></div>
            Edit Task
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-600 mb-6 border-b pb-4 border-gray-100">
            Update the details for this task and track progress.
          </Dialog.Description>

          <fieldset className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="task-content">
              Content
            </label>
            <textarea
              id="task-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm min-h-[80px] transition-all duration-200"
              rows={3}
              placeholder="Task description..."
            />
          </fieldset>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <fieldset>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                value={priority || ''}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white transition-all duration-200"
              >
                <option value="">None</option>
                <option value="low" className="text-emerald-700">Low</option>
                <option value="medium" className="text-amber-700">Medium</option>
                <option value="high" className="text-red-700">High</option>
              </select>
            </fieldset>

            <fieldset>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="task-dueDate">
                Due Date
              </label>
              <input
                id="task-dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
              />
            </fieldset>
          </div>

          <fieldset className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="task-tags">
              Tags 
              <span className="text-xs text-gray-500 ml-2">(comma-separated)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <input
                id="task-tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                placeholder="e.g., social, blog, urgent"
              />
            </div>
            {/* Tag suggestions */}
            <div className="flex flex-wrap gap-2 mt-2">
              {['social', 'blog', 'email', 'urgent', 'video'].map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    const currentTags = tags.length > 0 ? tags.split(',').map(t => t.trim()) : [];
                    if (!currentTags.includes(suggestion)) {
                      setTags(tags.length > 0 ? `${tags}, ${suggestion}` : suggestion);
                    }
                  }}
                  className="px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Color Picker */}
          <fieldset className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colore del task
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                "", // No color option
                "#F87171", // Red
                "#FBBF24", // Amber
                "#34D399", // Emerald
                "#60A5FA", // Blue
                "#A78BFA", // Violet
                "#F472B6", // Pink
                "#6EE7B7", // Teal
                "#C4B5FD"  // Purple light
              ].map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform ${
                    color === colorOption ? "scale-110 border-gray-800" : "border-gray-200"
                  }`}
                  style={{
                    backgroundColor: colorOption || "white",
                    boxShadow: color === colorOption ? "0 0 0 2px rgba(59, 130, 246, 0.5)" : "none"
                  }}
                  aria-label={colorOption ? `Color ${colorOption}` : "No color"}
                >
                  {color === colorOption && (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className={`h-4 w-4 ${!colorOption || colorOption === "#FBBF24" ? "text-gray-800" : "text-white"}`}
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                  {colorOption === "" && !color && (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="h-4 w-4 text-gray-400"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  )}
                </button>
              ))}
            </div>
            {color && (
              <div className="mt-2 flex items-center">
                <span className="text-xs text-gray-500">Colore selezionato: 
                  <span className="inline-block w-3 h-3 ml-1 rounded-sm" style={{ backgroundColor: color }}></span>
                  <span className="ml-1">{color}</span>
                </span>
              </div>
            )}
          </fieldset>

          <div className="mt-6 flex justify-between">
            {/* Delete button on the left */}
            {onDelete && task && (
              <button
                type="button"
                onClick={() => {
                  if (task && onDelete) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
            
            {/* Cancel and Save buttons on the right */}
            <div className="flex space-x-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes 
              </button>
            </div>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EditTaskDialog;

