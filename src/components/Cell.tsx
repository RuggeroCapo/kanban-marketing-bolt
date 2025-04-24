import React from 'react';
import StickyNote from './StickyNote';
import { Task } from '../types';

interface CellProps {
  columnId: string;
  laneId: string;
  tasks: Task[];
  // moveTask is no longer needed here if handled by parent div
  // createTask is no longer needed here if handled by parent div
  updateTaskContent: (taskId: string, newContent: string) => void;
}

// Cell becomes simpler, primarily responsible for rendering tasks within it.
// Drag/Drop/DoubleClick logic is moved to the parent container div in KanbanBoard.
const Cell: React.FC<CellProps> = ({ tasks, updateTaskContent }) => {

  return (
    <div
      className="p-2 h-full space-y-2" // Removed min-h, drop handlers, double-click
    >
      {tasks.map(task => (
        <StickyNote key={task.id} task={task} updateTaskContent={updateTaskContent} />
      ))}
       {/* Optional: Placeholder text when cell is empty */}
       {tasks.length === 0 && (
         <div className="text-center text-gray-400 text-xs pt-10"></div> // Remove double-click text
       )}
    </div>
  );
};

export default Cell;
