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
    e.currentTarget.classList.add('opacity-60', 'scale-95', 'shadow-lg', 'rotate-1'); // Enhanced visual feedback
    
    // Set a custom drag image if needed
    // const dragImage = document.createElement('div');
    // dragImage.textContent = task.content;
    // document.body.appendChild(dragImage);
    // e.dataTransfer.setDragImage(dragImage, 0, 0);
    // setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-60', 'scale-95', 'shadow-lg', 'rotate-1');
  };

  // Determine background color based on priority
  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-l-4 border-l-red-500 border-t border-r border-b border-red-200 hover:bg-red-100';
      case 'medium': return 'bg-amber-50 border-l-4 border-l-amber-500 border-t border-r border-b border-amber-200 hover:bg-amber-100';
      case 'low': return 'bg-emerald-50 border-l-4 border-l-emerald-500 border-t border-r border-b border-emerald-200 hover:bg-emerald-100';
      default: return 'bg-white border border-gray-200 hover:bg-gray-50';
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
      className={`p-3 mb-2 rounded-md shadow-sm hover:shadow-md cursor-pointer min-h-[90px] flex flex-col justify-between group transition-all duration-200 ${!task.color ? getPriorityColor(task.priority) : ''}`}
      style={task.color ? { backgroundColor: task.color, border: '2px solid #e5e7eb' } : {}}
      onClick={onClick} // Trigger dialog on click
    >
      {/* Priority Indicator Badge */}
      {task.priority && (
        <div className="flex justify-end mb-1">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full 
            ${task.priority === 'high' ? 'bg-red-100 text-red-700' : 
              task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 
              'bg-emerald-100 text-emerald-700'}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>
      )}
      
      {/* Display Content (Not Editable Here) */}
      <div
        className="text-sm break-words flex-grow font-medium" // Use break-words for long content
        style={{ minHeight: '40px' }} // Ensure minimum height
      >
        {task.content}
      </div>
      
      {/* Footer for Meta Info and Drag Handle */}
      <div className="mt-1 text-xs text-gray-500 flex justify-between items-center">
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
          {/* Due Date */}
          {task.dueDate && (
            <span className="flex items-center whitespace-nowrap bg-gray-100 px-1.5 py-0.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-0.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(task.dueDate)}
            </span>
          )}
          {/* Tags */}
          {task.tags && task.tags.map(tag => (
            <span key={tag} className="inline-block bg-indigo-50 text-indigo-700 rounded-full px-1.5 py-0.5 text-xs font-medium whitespace-nowrap">
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
