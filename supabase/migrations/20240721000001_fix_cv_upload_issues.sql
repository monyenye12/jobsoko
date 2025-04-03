-- Ensure the resume_url column exists in applications table
DO $
BEGIN
    -- First check if the applications table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'applications') THEN
        -- Add resume_url column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'applications' AND column_name = 'resume_url') THEN
            ALTER TABLE applications ADD COLUMN resume_url TEXT;
        END IF;
        
        -- Add cv_url column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'applications' AND column_name = 'cv_url') THEN
            ALTER TABLE applications ADD COLUMN cv_url TEXT;
        END IF;

        -- Update any existing applications to ensure cv_url and resume_url are in sync
        UPDATE applications 
        SET resume_url = cv_url 
        WHERE resume_url IS NULL AND cv_url IS NOT NULL;
        
        UPDATE applications 
        SET cv_url = resume_url 
        WHERE cv_url IS NULL AND resume_url IS NOT NULL;
    ELSE
        -- Create applications table if it doesn't exist
        CREATE TABLE IF NOT EXISTS applications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            job_id UUID NOT NULL,
            applicant_id UUID NOT NULL,
            employer_id UUID,
            status TEXT DEFAULT 'pending',
            cover_letter TEXT,
            cv_url TEXT,
            resume_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END
$;