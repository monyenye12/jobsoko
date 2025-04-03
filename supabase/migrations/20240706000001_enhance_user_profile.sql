-- Add new columns to users table for enhanced profile features
ALTER TABLE users ADD COLUMN IF NOT EXISTS education jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hourly_rate numeric;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dark_mode boolean DEFAULT false;

-- Enable realtime for the users table
ALTER publication supabase_realtime ADD TABLE users;
