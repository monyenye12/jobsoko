-- Fix RLS policies for applications table to allow job seekers to submit applications

-- First, drop any existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can create their own applications" ON applications;

-- Create a new policy that allows job seekers to submit applications
CREATE POLICY "Users can create their own applications"
ON applications
FOR INSERT
TO authenticated
WITH CHECK (applicant_id = auth.uid());

-- Ensure job seekers can view their own applications
DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
CREATE POLICY "Users can view their own applications"
ON applications
FOR SELECT
TO authenticated
USING (applicant_id = auth.uid());

-- Ensure employers can view applications for their jobs
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

-- Ensure employers can update applications for their jobs
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

-- Add resume_url column to applications if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'applications' AND column_name = 'resume_url') THEN
    ALTER TABLE applications ADD COLUMN resume_url TEXT;
  END IF;
END
$$;
