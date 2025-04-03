-- Add dark_mode column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT false;
