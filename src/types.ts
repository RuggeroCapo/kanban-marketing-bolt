export interface Task {
  id: string;
  content: string;
  columnId: string;
  laneId: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  dueDate?: string; // ISO string format e.g., "2024-12-31"
  color?: string; // Hex color code for task background
}

export interface Column {
  id: string;
  title: string;
}

export interface Lane {
  id: string;
  title: string;
}
