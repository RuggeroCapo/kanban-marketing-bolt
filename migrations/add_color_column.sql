-- Add color column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS color VARCHAR(9);
