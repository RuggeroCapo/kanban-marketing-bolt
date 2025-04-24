import { createClient } from '@supabase/supabase-js';
import { Task } from '../types';

// Supabase URL e anon key da variabili d'ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se le variabili d'ambiente sono definite
if (!supabaseUrl || !supabaseKey) {
  console.error('Le variabili d\'ambiente Supabase non sono configurate correttamente.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Mapping functions to convert between our app's Task type and Supabase table format
export const mapDbTaskToTask = (dbTask: any): Task => ({
  id: dbTask.id,
  content: dbTask.content,
  columnId: dbTask.column_id,
  laneId: dbTask.lane_id,
  priority: dbTask.priority,
  tags: dbTask.tags || [],
  dueDate: dbTask.due_date,
  color: dbTask.color,
});

export const mapTaskToDbTask = (task: Task) => ({
  id: task.id.startsWith('task-') ? undefined : task.id, // Let Supabase generate UUID for new tasks
  content: task.content,
  column_id: task.columnId,
  lane_id: task.laneId,
  priority: task.priority,
  tags: task.tags,
  due_date: task.dueDate,
  color: task.color,
});
