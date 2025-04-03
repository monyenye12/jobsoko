-- Add resume_url column to applications table if it doesn't exist

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'applications' AND column_name = 'resume_url') THEN
    ALTER TABLE applications ADD COLUMN resume_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'applications' AND column_name = 'notes') THEN
    ALTER TABLE applications ADD COLUMN notes TEXT;
  END IF;
END
$$;
