import React from 'react';
import { Task } from '../types';
import { GripVertical } from 'lucide-react';

interface StickyNoteProps {
  task: Task;
  onClick: () => void; // Changed from updateTaskContent to onClick for dialog trigger
}

const StickyNote: React.FC<StickyNoteProps> = ({ task, onClick }) => {

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
    e.currentTarget.classList.add('opacity-50', 'shadow-lg'); // Visual feedback
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'shadow-lg');
  };

  // Determine background color based on priority
  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300 hover:bg-red-200';
      case 'medium': return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200';
      case 'low': return 'bg-green-100 border-green-300 hover:bg-green-200';
      default: return 'bg-white border-gray-300 hover:bg-gray-50';
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      // Basic formatting, adjust as needed
      const date = new Date(dateString + 'T00:00:00'); // Assume local timezone if none specified
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString; // Return original string if formatting fails
    }
  };


  return (
    <div
      id={task.id}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`p-2 mb-2 rounded shadow border cursor-pointer ${getPriorityColor(task.priority)} min-h-[80px] flex flex-col justify-between group transition-colors duration-150`}
      onClick={onClick} // Trigger dialog on click
    >
      {/* Display Content (Not Editable Here) */}
      <div
        className="text-sm break-words flex-grow" // Use break-words for long content
        style={{ minHeight: '40px' }} // Ensure minimum height
      >
        {task.content}
      </div>

      {/* Footer for Meta Info and Drag Handle */}
      <div className="mt-1 text-xs text-gray-500 flex justify-between items-center">
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
          {/* Due Date */}
          {task.dueDate && (
            <span className="flex items-center whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(task.dueDate)}
            </span>
          )}
          {/* Tags */}
          {task.tags && task.tags.map(tag => (
            <span key={tag} className="inline-block bg-gray-200 rounded px-1.5 py-0.5 text-xs font-semibold text-gray-700 whitespace-nowrap">
              #{tag}
            </span>
          ))}
        </div>
        {/* Drag Handle */}
        <GripVertical size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab flex-shrink-0 ml-1" />
      </div>
    </div>
  );
};

export default StickyNote;
