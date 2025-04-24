import React, { useState, useMemo } from 'react';
import { initialColumns, initialLanes, initialTasks } from '../data';
import { Column, Lane, Task } from '../types';
import Cell from './Cell';
import StickyNote from './StickyNote';

const LANE_HEADER_WIDTH = '150px';
const BACKLOG_COLUMN_WIDTH = '250px';
const HEADER_HEIGHT = '49px'; // Define a fixed header height for alignment (adjust as needed)

const KanbanBoard: React.FC = () => {
  const [columns] = useState<Column[]>(initialColumns);
  const [lanes] = useState<Lane[]>(initialLanes);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const backlogColumn = useMemo(() => columns.find(col => col.id === 'backlog'), [columns]);
  const mainGridColumns = useMemo(() => columns.filter(col => col.id !== 'backlog'), [columns]);
  const backlogTasks = useMemo(() => tasks.filter(task => task.columnId === 'backlog'), [tasks]);

  const moveTask = (taskId: string, targetColumnId: string, targetLaneId: string | null) => {
    console.log(`Moving task ${taskId} to col ${targetColumnId}, lane ${targetLaneId}`);
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, columnId: targetColumnId, laneId: targetLaneId ?? task.laneId }
          : task
      )
    );
  };

  const createTask = (columnId: string, laneId: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      content: 'Nuovo Task...',
      columnId,
      laneId,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    console.log(`Created task in col ${columnId}, lane ${laneId}`);
  };

   const createBacklogTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      content: 'Nuovo Task Backlog...',
      columnId: 'backlog',
      laneId: '',
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    console.log(`Created task in backlog`);
  };

  const updateTaskContent = (taskId: string, newContent: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, content: newContent } : task
      )
    );
    console.log(`Task ${taskId} content updated to: ${newContent}`);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget.dataset.columnId) {
        e.currentTarget.classList.add('bg-blue-50');
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
     if (e.currentTarget.dataset.columnId) {
        e.currentTarget.classList.remove('bg-blue-50');
     }
  };

  const handleDropOnCell = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const cellDiv = e.currentTarget;
    cellDiv.classList.remove('bg-blue-50');
    const taskId = e.dataTransfer.getData('taskId');
    const targetColumnId = cellDiv.dataset.columnId;
    const targetLaneId = cellDiv.dataset.laneId;

    if (taskId && targetColumnId && targetLaneId) {
      moveTask(taskId, targetColumnId, targetLaneId);
    } else {
        console.error("Drop failed: Missing data attributes on cell", {taskId, targetColumnId, targetLaneId});
    }
  };

  const handleDropOnBacklog = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const backlogDiv = e.currentTarget;
    backlogDiv.classList.remove('bg-blue-50');
    const taskId = e.dataTransfer.getData('taskId');
    const targetColumnId = backlogDiv.dataset.columnId;

    if (taskId && targetColumnId) {
      moveTask(taskId, targetColumnId, null);
    } else {
         console.error("Drop failed: Missing data attributes on backlog", {taskId, targetColumnId});
    }
  };

  if (!backlogColumn) {
    return <div>Error: Backlog column configuration not found.</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Moved Title outside the main flex container */}
      <h1 className="text-2xl font-bold p-4 text-center text-gray-700 bg-gray-100 border-b border-gray-300">
        Bacheca Kanban Marketing
      </h1>

      {/* Main content area with Backlog and Grid */}
      <div className="flex flex-grow overflow-hidden"> {/* Use flex-grow and overflow-hidden */}

        {/* Standalone Backlog Column */}
        <div
          className="flex flex-col h-full border-r border-gray-300 bg-gray-200 shadow-md" // h-full ensures it tries to fill parent
          style={{ width: BACKLOG_COLUMN_WIDTH, minWidth: BACKLOG_COLUMN_WIDTH }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDropOnBacklog}
          data-column-id={backlogColumn.id}
        >
          {/* Backlog Header - Apply fixed height and alignment */}
          <div
            className="p-3 bg-gray-300 text-center font-semibold text-gray-800 border-b border-gray-300 sticky top-0 z-10 flex items-center justify-center"
            style={{ height: HEADER_HEIGHT }} // Apply fixed height
          >
            {backlogColumn.title}
          </div>
          {/* Backlog Task List - Allow vertical scroll */}
          <div className="flex-grow overflow-y-auto p-2 space-y-2" onDoubleClick={createBacklogTask}>
            {backlogTasks.map(task => (
              <StickyNote key={task.id} task={task} updateTaskContent={updateTaskContent} />
            ))}
            {backlogTasks.length === 0 && (
               <div className="text-center text-gray-400 text-xs pt-10">Double-click to add</div>
             )}
          </div>
        </div>

        {/* Main Board Container (Scrollable Horizontally) */}
        <div className="flex-grow overflow-x-auto overflow-y-hidden"> {/* Allow x-scroll, prevent y-scroll here */}
          <div
            className="grid gap-0 relative h-full" // Make grid take full height of its container
            style={{
              gridTemplateColumns: `${LANE_HEADER_WIDTH} repeat(${mainGridColumns.length}, minmax(200px, 1fr))`,
              // Header row + content taking remaining space
              gridTemplateRows: `${HEADER_HEIGHT} minmax(0, 1fr)`, // Header row fixed height, content takes rest
              minWidth: `calc(${LANE_HEADER_WIDTH} + ${mainGridColumns.length * 200}px)`,
            }}
          >
            {/* Top-left empty corner - Apply fixed height */}
            <div
              className="sticky top-0 left-0 z-30 bg-gray-100 border-b border-r border-gray-300"
              style={{ height: HEADER_HEIGHT }} // Match header height
            ></div>

            {/* Main Grid Column Headers - Apply fixed height and alignment */}
            {mainGridColumns.map((column, index) => (
              <div
                key={column.id}
                className="sticky top-0 z-10 bg-gray-200 p-2 shadow text-center font-semibold text-gray-700 border-b border-r border-gray-300 flex items-center justify-center"
                style={{
                  gridColumn: index + 2,
                  gridRow: 1,
                  height: HEADER_HEIGHT // Apply fixed height
                }}
              >
                {column.title}
              </div>
            ))}

            {/* Lane Headers and Cells Container (Scrollable Vertically) */}
            {/* We need a container for the lanes/cells part to handle its own vertical scroll */}
            <div
              className="col-start-1 col-span-1 row-start-2 row-span-1 overflow-y-auto sticky left-0 z-20" // Lane headers container
              style={{ gridRow: '2 / -1', gridColumn: '1 / 2' }} // Span all lane rows
            >
                 {lanes.map((lane) => (
                    <div
                        key={lane.id}
                        className="bg-blue-100 p-2 shadow flex items-center justify-center text-center font-semibold text-blue-800 border-b border-r border-gray-300 min-h-[150px]" // Ensure min height for visibility
                        // Removed sticky here, handled by parent div
                    >
                        {lane.title}
                    </div>
                 ))}
            </div>

            <div
              className="col-start-2 col-span-full row-start-2 row-span-1 overflow-auto" // Cells container - SCROLLS
              style={{ gridRow: '2 / -1', gridColumn: `2 / ${mainGridColumns.length + 2}` }}
            >
                <div
                    className="grid gap-0" // Inner grid for just the cells
                    style={{
                        gridTemplateColumns: `repeat(${mainGridColumns.length}, minmax(200px, 1fr))`,
                        gridTemplateRows: `repeat(${lanes.length}, auto)`, // Rows based on lanes
                        // This inner grid's height will grow, the parent div scrolls
                    }}
                >
                    {lanes.map((lane, laneIndex) => (
                        <React.Fragment key={lane.id}>
                        {mainGridColumns.map((column, colIndex) => {
                            const cellTasks = tasks.filter(task => task.columnId === column.id && task.laneId === lane.id);
                            return (
                            <div
                                key={`${column.id}-${lane.id}`}
                                className="bg-white border-b border-r border-gray-300 min-h-[150px]"
                                style={{ gridRow: laneIndex + 1, gridColumn: colIndex + 1 }} // Relative to inner grid
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDropOnCell}
                                onDoubleClick={(e) => {
                                if (e.target === e.currentTarget) createTask(column.id, lane.id);
                                }}
                                data-column-id={column.id}
                                data-lane-id={lane.id}
                            >
                                <Cell
                                columnId={column.id}
                                laneId={lane.id}
                                tasks={cellTasks}
                                updateTaskContent={updateTaskContent}
                                />
                            </div>
                            );
                        })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
