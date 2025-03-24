-- Fix users table constraints
ALTER TABLE users ALTER COLUMN role DROP NOT NULL;

-- Ensure the table is part of realtime
alter publication supabase_realtime add table users;
