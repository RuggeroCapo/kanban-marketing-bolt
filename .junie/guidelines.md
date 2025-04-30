# Kanban Marketing Bolt - Development Guidelines

## Build/Configuration Instructions

### Prerequisites
- Node.js (v18+ recommended)
- pnpm (preferred) or npm

### Environment Setup
1. Create a `.env` file in the project root with the following Supabase configuration:
   ```
   VITE_SUPABASE_URL=https://tmxzrsayqgidzkhnmisv.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRteHpyc2F5cWdpZHpraG5taXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODU5NzYsImV4cCI6MjA2MTA2MTk3Nn0.WDSK3OWMlBGSIW11Rvs6RkF_XuTtbj0y0dQiBX4lm2s
   ```

### Database Setup
1. The project uses Supabase as the backend database.
2. The database schema includes a `tasks` table with the following structure:
   - `id`: UUID (primary key)
   - `content`: Text (task content)
   - `column_id`: String (references column ID)
   - `lane_id`: String (references lane ID)
   - `priority`: Enum ('low', 'medium', 'high')
   - `tags`: Array of strings
   - `due_date`: Date string
   - `color`: VARCHAR(9) (hex color code)

3. Run the migration in the `migrations` directory to ensure the database schema is up to date:
   ```sql
   -- Add color column to tasks table
   ALTER TABLE tasks 
   ADD COLUMN IF NOT EXISTS color VARCHAR(9);
   ```

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Development Information

### Project Structure
- `src/components/`: React components
  - `KanbanBoard.tsx`: Main Kanban board component
  - `StickyNote.tsx`: Component for individual task notes
  - `Cell.tsx`: Cell component for the Kanban board
  - `EditTaskDialog.tsx`: Dialog for editing tasks
- `src/lib/`: Utility functions and services
  - `supabase.ts`: Supabase client configuration and data mapping
  - `taskService.ts`: Functions for interacting with tasks in the database
- `src/types.ts`: TypeScript type definitions
- `src/data.ts`: Initial data for columns and lanes

### Data Model
The application uses three main data types:
1. **Task**: Represents a task on the Kanban board
   ```typescript
   interface Task {
     id: string;
     content: string;
     columnId: string;
     laneId: string;
     priority?: 'low' | 'medium' | 'high';
     tags?: string[];
     dueDate?: string; // ISO string format e.g., "2024-12-31"
     color?: string; // Hex color code for task background
   }
   ```

2. **Column**: Represents a column in the Kanban board
   ```typescript
   interface Column {
     id: string;
     title: string;
   }
   ```

3. **Lane**: Represents a lane in the Kanban board
   ```typescript
   interface Lane {
     id: string;
     title: string;
   }
   ```

### Task Management
- Tasks are stored in Supabase and managed through the `taskService.ts` functions.
- Temporary tasks (with IDs starting with 'task-') are handled differently from persisted tasks.
- The application supports creating, updating, moving, and deleting tasks.

### UI Language
- The UI is in Italian, with column and lane titles defined in `data.ts`.

### Styling
- The project uses TailwindCSS for styling.
- Custom styles are defined in `index.css`.

### Development Workflow
1. Make changes to the codebase
2. Run `pnpm dev` to start the development server
3. Test changes in the browser
4. Build with `pnpm build` when ready for production