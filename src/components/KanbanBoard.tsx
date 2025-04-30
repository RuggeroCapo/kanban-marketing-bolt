import React, { useState, useMemo, useEffect } from 'react';
import { initialColumns, initialLanes, initialTasks } from '../data';
import { Column, Lane, Task } from '../types';
import Cell from './Cell';
import StickyNote from './StickyNote';
import EditTaskDialog from './EditTaskDialog';
import ImportTasksDialog from './ImportTasksDialog';
import { getAllTasks, saveTask, moveTask as moveTaskInDb, deleteTask } from '../lib/taskService';

const LANE_HEADER_WIDTH = '150px';
const BACKLOG_COLUMN_WIDTH = '250px';
const HEADER_HEIGHT = '49px';

const KanbanBoard: React.FC = () => {
  const [columns] = useState<Column[]>(initialColumns);
  const [lanes] = useState<Lane[]>(initialLanes);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for managing the edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // State for search and filtering
  const [searchText, setSearchText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  // State for managing the import dialog
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Load tasks from Supabase on component mount
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        const fetchedTasks = await getAllTasks();
        if (fetchedTasks.length > 0) {
          setTasks(fetchedTasks);
        } else {
          setTasks(initialTasks); // Fallback to initial data if no tasks in DB
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setTasks(initialTasks); // Fallback to initial data on error
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Get all unique tags from all tasks
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();

    tasks.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(tag => tagSet.add(tag));
      }
    });

    return Array.from(tagSet).sort();
  }, [tasks]);

  // Apply filters to tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search text filter (searches in content and tags)
      const matchesSearch = !searchText || 
        (task.content && task.content.toLowerCase().includes(searchText.toLowerCase())) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase())));

      // Priority filter
      const matchesPriority = !priorityFilter || task.priority === priorityFilter;

      // Tag filter
      const matchesTag = !tagFilter || (task.tags && task.tags.includes(tagFilter));

      return matchesSearch && matchesPriority && matchesTag;
    });
  }, [tasks, searchText, priorityFilter, tagFilter]);

  const backlogColumn = useMemo(() => columns.find(col => col.id === 'backlog'), [columns]);
  const mainGridColumns = useMemo(() => columns.filter(col => col.id !== 'backlog'), [columns]);
  const backlogTasks = useMemo(() => filteredTasks.filter(task => task.columnId === 'backlog'), [filteredTasks]);

  const moveTask = (taskId: string, targetColumnId: string, targetLaneId: string | null) => {
    console.log(`Moving task ${taskId} to col ${targetColumnId}, lane ${targetLaneId}`);

    // Update local state
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, columnId: targetColumnId, laneId: targetLaneId ?? task.laneId }
          : task
      )
    );

    // Update in Supabase (for non-temporary IDs)
    if (!taskId.startsWith('task-')) {
      moveTaskInDb(taskId, targetColumnId, targetLaneId ?? '')
        .catch(err => console.error('Failed to update task position in database:', err));
    }
  };

  const createTask = (columnId: string, laneId: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      content: 'Nuovo Task...',
      columnId,
      laneId,
      // Optionally set default priority/tags/etc.
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    // Open dialog immediately to edit the new task
    setEditingTask(newTask);
    setIsEditDialogOpen(true);
    console.log(`Created task in col ${columnId}, lane ${laneId}, opening edit dialog.`);
  };

   const createBacklogTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      content: 'Nuovo Task Backlog...',
      columnId: 'backlog',
      laneId: '', // Backlog tasks don't have a laneId
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
     // Open dialog immediately to edit the new task
    setEditingTask(newTask);
    setIsEditDialogOpen(true);
    console.log(`Created task in backlog, opening edit dialog.`);
  };

  // Function to open the dialog for a specific task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  // Function to close the dialog
  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setEditingTask(null); // Clear the task being edited
  };

  // Function to delete a task
  const handleDeleteTask = (taskId: string) => {
    // Remove from local state immediately
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

    // Delete from Supabase (only if it's not a temporary task)
    if (!taskId.startsWith('task-')) {
      deleteTask(taskId).catch(err => {
        console.error('Failed to delete task from database:', err);
      });
    }
    console.log(`Task ${taskId} deleted.`);
  };

  // Function to save changes from the dialog
  const handleSaveTask = (updatedTask: Task) => {
    // Update local state immediately for responsive UI
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );

    // Save to Supabase
    saveTask(updatedTask).then(savedTask => {
      if (savedTask && savedTask.id !== updatedTask.id) {
        // If this was a new task and we got a new ID from Supabase
        // update the local state to use the persistent ID
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === updatedTask.id ? savedTask : task
          )
        );
      }
    }).catch(err => {
      console.error('Failed to save task to database:', err);
    });

    handleCloseDialog(); // Close the dialog after saving
    console.log(`Task ${updatedTask.id} updated.`);
  };

  // Function to handle imported tasks
  const handleImportTasks = (importedTasks: Task[]) => {
    // For each imported task, we need to assign a lane if it's not in the backlog
    const processedTasks = importedTasks.map(task => {
      // If the task is not in the backlog and doesn't have a laneId, assign it to the first lane
      if (task.columnId !== 'backlog' && (!task.laneId || task.laneId === '')) {
        return {
          ...task,
          laneId: lanes.length > 0 ? lanes[0].id : '',
        };
      }
      return task;
    });

    // Add the imported tasks to the local state
    setTasks(prevTasks => [...prevTasks, ...processedTasks]);

    // Save each task to Supabase
    processedTasks.forEach(task => {
      saveTask(task).then(savedTask => {
        if (savedTask) {
          // Update the local state with the saved task (which has a permanent ID)
          setTasks(prevTasks =>
            prevTasks.map(t =>
              t.id === task.id ? savedTask : t
            )
          );
        }
      }).catch(err => {
        console.error('Failed to save imported task to database:', err);
      });
    });

    console.log(`Imported ${processedTasks.length} tasks.`);
  };


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget.dataset.columnId) {
        e.currentTarget.classList.add('bg-blue-50', 'border-blue-300', 'border-2');
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
     if (e.currentTarget.dataset.columnId) {
        e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300', 'border-2');
     }
  };

  const handleDropOnCell = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const cellDiv = e.currentTarget;
    cellDiv.classList.remove('bg-blue-50', 'border-blue-300', 'border-2');
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
    backlogDiv.classList.remove('bg-blue-50', 'border-blue-300', 'border-2');
    const taskId = e.dataTransfer.getData('taskId');
    const targetColumnId = backlogDiv.dataset.columnId;

    if (taskId && targetColumnId) {
      moveTask(taskId, targetColumnId, null); // Move to backlog, laneId is null/irrelevant
    } else {
         console.error("Drop failed: Missing data attributes on backlog", {taskId, targetColumnId});
    }
  };

  if (!backlogColumn) {
    return <div>Error: Backlog column configuration not found.</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading Kanban Board...</p>
        </div>
      )}

      {/* Enhanced Header with gradient and better styling */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bacheca Kanban Marketing</h1>

          {/* Filter and Search Controls */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cerca task..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-8 pr-4 py-1 bg-white/20 border border-white/30 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/70"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-2 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white/20 border border-white/30 rounded-md text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-white/50 text-white"
            >
              <option value="" className="text-gray-800">Tutte le Priorità</option>
              <option value="high" className="text-gray-800">Alta Priorità</option>
              <option value="medium" className="text-gray-800">Media Priorità</option>
              <option value="low" className="text-gray-800">Bassa Priorità</option>
            </select>

            <select 
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="bg-white/20 border border-white/30 rounded-md text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-white/50 text-white"
            >
              <option value="" className="text-gray-800">Tutti i Tag</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag} className="text-gray-800">
                  {tag}
                </option>
              ))}
            </select>

            {/* Import Button - Subtle and Minimalistic */}
            <button
              onClick={() => setIsImportDialogOpen(true)}
              className="text-white/70 hover:text-white p-1.5 rounded-full focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors duration-200"
              title="Importa task da JSON"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </button>
          </div>
        </div>
      </header>

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
          {/* Backlog Header */}
          <div
            className="p-3 bg-gray-300 text-center font-semibold text-gray-800 border-b border-gray-300 sticky top-0 z-10 flex items-center justify-between"
            style={{ height: HEADER_HEIGHT }} // Apply fixed height
          >
            <span className="flex-grow text-center">{backlogColumn.title}</span>

            {/* Task Counter Badge */}
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {backlogTasks.length}
            </span>

            {/* Add Task Button */}
            <button 
              className="ml-2 p-1 rounded-full hover:bg-gray-400 text-gray-600 transition-colors duration-200"
              onClick={createBacklogTask}
              title="Add backlog task"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          {/* Backlog Task List with Loading State */}
          <div className="flex-grow overflow-y-auto p-2 space-y-2" onDoubleClick={createBacklogTask}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-2">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500">Loading tasks...</p>
              </div>
            ) : (
              <>
                {backlogTasks.map(task => (
                  <StickyNote
                    key={task.id}
                    task={task}
                    onClick={() => handleEditTask(task)} // Pass handler to open dialog
                  />
                ))}
                {backlogTasks.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-10 px-3 border-2 border-dashed border-gray-300 rounded-lg">
                    <p>Nessun task nel backlog</p>
                    <p className="text-xs mt-1">Doppio click o usa + per aggiungere</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Main Board Container (Scrollable Horizontally) */}
        <div className="flex-grow overflow-x-auto overflow-y-hidden">
          <div
            className="grid gap-0 relative h-full"
            style={{
              gridTemplateColumns: `${LANE_HEADER_WIDTH} repeat(${mainGridColumns.length}, minmax(200px, 1fr))`,
              gridTemplateRows: `${HEADER_HEIGHT} minmax(0, 1fr)`,
              minWidth: `calc(${LANE_HEADER_WIDTH} + ${mainGridColumns.length * 200}px)`,
            }}
          >
            {/* Top-left empty corner */}
            <div
              className="sticky top-0 left-0 z-30 bg-gray-100 border-b border-r border-gray-300"
              style={{ height: HEADER_HEIGHT }}
            ></div>

            {/* Main Grid Column Headers */}
            {mainGridColumns.map((column, index) => {
              // Count tasks in this column for the counter badge
              const columnTaskCount = filteredTasks.filter(task => task.columnId === column.id).length;

              return (
                <div
                  key={column.id}
                  className="sticky top-0 z-10 bg-gray-200 p-2 shadow text-center font-semibold text-gray-700 border-b border-r border-gray-300 flex items-center justify-between"
                  style={{
                    gridColumn: index + 2,
                    gridRow: 1,
                    height: HEADER_HEIGHT
                  }}
                >
                  <span className="flex-grow text-center">{column.title}</span>

                  {/* Task Counter Badge */}
                  <span className="inline-flex items-center justify-center w-6 h-6 ml-2 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {columnTaskCount}
                  </span>

                  {/* Add Task Button */}
                  <button 
                    className="ml-2 p-1 rounded-full hover:bg-gray-300 text-gray-600 transition-colors duration-200"
                    onClick={() => {
                      // Find first lane to add task to
                      if (lanes.length > 0) {
                        createTask(column.id, lanes[0].id);
                      }
                    }}
                    title="Add task to this column"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              );
            })}

            {/* Lane Headers Container */}
            <div
              className="col-start-1 col-span-1 row-start-2 row-span-1 overflow-y-auto sticky left-0 z-20"
              style={{ gridRow: '2 / -1', gridColumn: '1 / 2' }}
            >
                 {lanes.map((lane) => (
  <div
    key={lane.id}
    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 shadow-sm flex items-center justify-center text-center font-medium text-indigo-800 border-b border-r border-gray-200 min-h-[150px]"
  >
    <div className="flex flex-col items-center">
      <span>{lane.title}</span>
      {/* Lane collapse toggle button - can be made functional in future */}
      <button className="mt-2 text-indigo-500 hover:text-indigo-700 p-1 rounded-full hover:bg-indigo-100 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  </div>
))}

            </div>

            {/* Cells Container */}
            <div
              className="col-start-2 col-span-full row-start-2 row-span-1 overflow-auto"
              style={{ gridRow: '2 / -1', gridColumn: `2 / ${mainGridColumns.length + 2}` }}
            >
                <div
                    className="grid gap-0"
                    style={{
                        gridTemplateColumns: `repeat(${mainGridColumns.length}, minmax(200px, 1fr))`,
                        gridTemplateRows: `repeat(${lanes.length}, auto)`,
                    }}
                >
                    {lanes.map((lane, laneIndex) => (
                        <React.Fragment key={lane.id}>
                        {mainGridColumns.map((column, colIndex) => {
                            const cellTasks = filteredTasks.filter(task => task.columnId === column.id && task.laneId === lane.id);
                            return (
                            <div
                                key={`${column.id}-${lane.id}`}
                                className="bg-white border-b border-r border-gray-200 min-h-[150px] transition-all duration-200 hover:bg-gray-50"
                                style={{ gridRow: laneIndex + 1, gridColumn: colIndex + 1 }}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDropOnCell}
                                onDoubleClick={() => createTask(column.id, lane.id)}
                                data-column-id={column.id}
                                data-lane-id={lane.id}
                            >
                                {/* Pass handleEditTask down to Cell */}
                                <Cell
                                  columnId={column.id}
                                  laneId={lane.id}
                                  tasks={cellTasks}
                                  onEditTask={handleEditTask} // Pass down the handler
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

      {/* Render the Edit Task Dialog */}
      <EditTaskDialog
        task={editingTask}
        isOpen={isEditDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* Render the Import Tasks Dialog */}
      <ImportTasksDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportTasks}
      />
    </div>
  );
};

export default KanbanBoard;
