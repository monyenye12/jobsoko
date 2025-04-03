-- Ensure payment_frequency column exists in jobs table
ALTER TABLE IF EXISTS jobs
ADD COLUMN IF NOT EXISTS payment_frequency TEXT;

-- Make sure the column is included in realtime
alter publication supabase_realtime add table jobs;
