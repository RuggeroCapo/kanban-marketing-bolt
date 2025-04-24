import { supabase, mapDbTaskToTask, mapTaskToDbTask } from './supabase';
import { Task } from '../types';

// Get all tasks
export const getAllTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*');
    
  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  
  return data.map(mapDbTaskToTask);
};

// Save a task (create or update)
export const saveTask = async (task: Task): Promise<Task | null> => {
  const dbTask = mapTaskToDbTask(task);
  
  // If task has a non-temporary ID (not task-xxx), update it
  if (task.id && !task.id.startsWith('task-')) {
    const { data, error } = await supabase
      .from('tasks')
      .update(dbTask)
      .eq('id', task.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating task:', error);
      return null;
    }
    
    return mapDbTaskToTask(data);
  } else {
    // Create new task, let Supabase generate UUID
    const { data, error } = await supabase
      .from('tasks')
      .insert(dbTask)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating task:', error);
      return null;
    }
    
    return mapDbTaskToTask(data);
  }
};

// Move task to different column/lane
export const moveTask = async (taskId: string, columnId: string, laneId: string): Promise<boolean> => {
  // For temporary tasks that haven't been saved to Supabase yet
  if (taskId.startsWith('task-')) {
    return false;
  }

  const { error } = await supabase
    .from('tasks')
    .update({ column_id: columnId, lane_id: laneId })
    .eq('id', taskId);
    
  if (error) {
    console.error('Error moving task:', error);
    return false;
  }
  
  return true;
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<boolean> => {
  // Don't try to delete temporary tasks from Supabase
  if (taskId.startsWith('task-')) {
    return true;
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
    
  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }
  
  return true;
};
