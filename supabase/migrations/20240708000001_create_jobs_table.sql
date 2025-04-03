-- Create jobs table if it doesn't exist already
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  payment_frequency TEXT,
  skills TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  deadline DATE,
  status TEXT DEFAULT 'active',
  urgent BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policy for employers to manage their own jobs
DROP POLICY IF EXISTS "Employers can manage their own jobs" ON jobs;
CREATE POLICY "Employers can manage their own jobs"
  ON jobs
  FOR ALL
  TO authenticated
  USING (employer_id = auth.uid() OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Create policy for job seekers to view active jobs
DROP POLICY IF EXISTS "Job seekers can view active jobs" ON jobs;
CREATE POLICY "Job seekers can view active jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Add to realtime publication
alter publication supabase_realtime add table jobs;
