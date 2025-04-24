import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Task } from '../types';

interface EditTaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({ task, isOpen, onClose, onSave }) => {
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>(undefined);
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState(''); // Comma-separated string for simplicity

  useEffect(() => {
    if (task) {
      setContent(task.content);
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
      setTags(task.tags ? task.tags.join(', ') : '');
    } else {
      // Reset form when task is null (dialog closed or no task selected)
      setContent('');
      setPriority(undefined);
      setDueDate('');
      setTags('');
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
    };
    onSave(updatedTask);
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
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[90vw] max-w-md data-[state=open]:animate-contentShow z-50"
          onClick={handleContentClick} // Prevent closing on content click
          onEscapeKeyDown={onClose}
          onPointerDownOutside={onClose} // Close on clicking outside
        >
          <Dialog.Title className="text-lg font-semibold mb-4 text-gray-800">Edit Task</Dialog.Title>
          <Dialog.Description className="text-sm text-gray-600 mb-5">
            Update the details for this task.
          </Dialog.Description>

          <fieldset className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="task-content">
              Content
            </label>
            <textarea
              id="task-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm min-h-[80px]"
              rows={3}
            />
          </fieldset>

          <fieldset className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="task-priority">
              Priority
            </label>
            <select
              id="task-priority"
              value={priority || ''} // Handle undefined case for select
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </fieldset>

          <fieldset className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="task-dueDate">
              Due Date
            </label>
            <input
              id="task-dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </fieldset>

          <fieldset className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="task-tags">
              Tags (comma-separated)
            </label>
            <input
              id="task-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., social, blog, urgent"
            />
          </fieldset>

          <div className="mt-6 flex justify-end space-x-3">
            <Dialog.Close asChild>
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
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

// Add keyframes for animations in index.css if they don't exist
/*
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  @keyframes overlayShow {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes contentShow {
    from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
  .animate-overlayShow { animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1); }
  .animate-contentShow { animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1); }
}
*/
