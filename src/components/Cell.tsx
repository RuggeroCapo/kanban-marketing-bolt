import React from 'react';
import { Task } from '../types';
import StickyNote from './StickyNote';

interface CellProps {
  columnId: string;
  laneId: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const Cell: React.FC<CellProps> = ({ tasks, onEditTask }) => {
  return (
    <div className="p-2 h-full space-y-2 transition-all duration-300">
      {tasks.map(task => (
        <StickyNote
          key={task.id}
          task={task}
          onClick={() => onEditTask(task)}
        />
      ))}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="text-sm">Double-click to add task</p>
        </div>
      )}
    </div>
  );
};

export default Cell;
