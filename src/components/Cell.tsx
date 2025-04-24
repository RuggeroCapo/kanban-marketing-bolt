import React from 'react';
import { Task } from '../types';
import StickyNote from './StickyNote';

interface CellProps {
  columnId: string;
  laneId: string;
  tasks: Task[];
  onEditTask: (task: Task) => void; // Add prop to handle editing
  // Remove updateTaskContent as it's handled by the dialog now
}

const Cell: React.FC<CellProps> = ({ tasks, onEditTask }) => {
  return (
    <div className="p-2 h-full space-y-2"> {/* Add padding and ensure full height if needed */}
      {tasks.map(task => (
        <StickyNote
          key={task.id}
          task={task}
          onClick={() => onEditTask(task)} // Pass the handler to StickyNote
        />
      ))}
       {tasks.length === 0 && (
         <div className="text-center text-gray-400 text-xs pt-10">Double-click to add</div>
       )}
    </div>
  );
};

export default Cell;
