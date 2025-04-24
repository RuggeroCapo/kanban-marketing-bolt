import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { GripVertical } from 'lucide-react'; // Corrected icon import

interface StickyNoteProps {
  task: Task;
  updateTaskContent: (taskId: string, newContent: string) => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({ task, updateTaskContent }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(task.content);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContent(task.content); // Update local state if task prop changes externally
  }, [task.content]);

  const handleBlur = () => {
    setIsEditing(false);
    if (content.trim() !== task.content) {
      updateTaskContent(task.id, content.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line on Enter
      contentRef.current?.blur(); // Trigger blur to save
    }
  };

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
      case 'high': return 'bg-red-100 border-red-300';
      case 'medium': return 'bg-yellow-100 border-yellow-300';
      case 'low': return 'bg-green-100 border-green-300';
      default: return 'bg-white border-gray-300';
    }
  };

  return (
    <div
      id={task.id}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`p-2 mb-2 rounded shadow border cursor-grab ${getPriorityColor(task.priority)} min-h-[80px] flex flex-col justify-between group`}
      onClick={() => !isEditing && setIsEditing(true)} // Allow editing on click
    >
      <div
        ref={contentRef}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        className={`text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 py-0.5 ${isEditing ? 'cursor-text' : 'cursor-pointer'} flex-grow`}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{ minHeight: '40px' }} // Ensure minimum height for editing
      >
        {content}
      </div>
      <div className="mt-1 text-xs text-gray-500 flex justify-between items-center">
        <div>
          {task.dueDate && <span className="mr-2">📅 {task.dueDate}</span>}
          {task.tags && task.tags.map(tag => (
            <span key={tag} className="inline-block bg-gray-200 rounded px-1.5 py-0.5 text-xs font-semibold text-gray-700 mr-1">
              #{tag}
            </span>
          ))}
        </div>
        {/* Use GripVertical icon for drag handle */}
        <GripVertical size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
      </div>
    </div>
  );
};

export default StickyNote;
