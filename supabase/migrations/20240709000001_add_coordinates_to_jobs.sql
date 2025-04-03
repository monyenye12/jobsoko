-- Add latitude and longitude columns to jobs table for map functionality
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Enable realtime for jobs table
alter publication supabase_realtime add table jobs;
