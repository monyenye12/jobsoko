-- Fix applications table to include CV URL
ALTER TABLE IF EXISTS applications
ADD COLUMN IF NOT EXISTS cv_url TEXT,
ADD COLUMN IF NOT EXISTS employer_id UUID REFERENCES auth.users(id);

-- Enable realtime for applications table
alter publication supabase_realtime add table applications;
