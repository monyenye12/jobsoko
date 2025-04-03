-- Create applications table if it doesn't exist already
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) NOT NULL,
  applicant_id UUID REFERENCES users(id) NOT NULL,
  status TEXT DEFAULT 'pending',
  cover_letter TEXT,
  resume_url TEXT,
  interview_date TIMESTAMP WITH TIME ZONE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, applicant_id)
);

-- Enable row level security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create policy for job seekers to manage their own applications
DROP POLICY IF EXISTS "Job seekers can manage their own applications" ON applications;
CREATE POLICY "Job seekers can manage their own applications"
  ON applications
  FOR ALL
  TO authenticated
  USING (applicant_id = auth.uid());

-- Create policy for employers to view applications for their jobs
DROP POLICY IF EXISTS "Employers can view applications for their jobs" ON applications;
CREATE POLICY "Employers can view applications for their jobs"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    job_id IN (
      SELECT id FROM jobs WHERE employer_id = auth.uid()
    )
  );

-- Create policy for employers to update applications for their jobs
DROP POLICY IF EXISTS "Employers can update applications for their jobs" ON applications;
CREATE POLICY "Employers can update applications for their jobs"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (
    job_id IN (
      SELECT id FROM jobs WHERE employer_id = auth.uid()
    )
  );

-- Add to realtime publication
alter publication supabase_realtime add table applications;
