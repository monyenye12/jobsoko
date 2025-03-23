-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude FLOAT,
  longitude FLOAT,
  salary TEXT,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  skills TEXT[],
  deadline TIMESTAMP WITH TIME ZONE,
  urgent BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Enable row level security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON jobs;
CREATE POLICY "Jobs are viewable by everyone"
  ON jobs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Employers can insert their own jobs" ON jobs;
CREATE POLICY "Employers can insert their own jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can update their own jobs" ON jobs;
CREATE POLICY "Employers can update their own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can delete their own jobs" ON jobs;
CREATE POLICY "Employers can delete their own jobs"
  ON jobs FOR DELETE
  USING (auth.uid() = employer_id);

-- Enable realtime
alter publication supabase_realtime add table jobs;
