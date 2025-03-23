-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  cover_note TEXT,
  interview_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(job_id, applicant_id)
);

-- Enable row level security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Job seekers can view their own applications" ON applications;
CREATE POLICY "Job seekers can view their own applications"
  ON applications FOR SELECT
  USING (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Employers can view applications for their jobs" ON applications;
CREATE POLICY "Employers can view applications for their jobs"
  ON applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = applications.job_id
    AND jobs.employer_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Job seekers can insert their own applications" ON applications;
CREATE POLICY "Job seekers can insert their own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Job seekers can update their own applications" ON applications;
CREATE POLICY "Job seekers can update their own applications"
  ON applications FOR UPDATE
  USING (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Employers can update applications for their jobs" ON applications;
CREATE POLICY "Employers can update applications for their jobs"
  ON applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = applications.job_id
    AND jobs.employer_id = auth.uid()
  ));

-- Enable realtime
alter publication supabase_realtime add table applications;
