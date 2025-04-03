-- This migration ensures that all necessary columns exist for the dashboard to function properly

-- Ensure payment_frequency column exists in jobs table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'payment_frequency') THEN
        ALTER TABLE jobs ADD COLUMN payment_frequency TEXT DEFAULT 'Monthly';
    END IF;
END
$$;

-- Ensure latitude and longitude columns exist in jobs table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'latitude') THEN
        ALTER TABLE jobs ADD COLUMN latitude DOUBLE PRECISION DEFAULT -1.28;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'longitude') THEN
        ALTER TABLE jobs ADD COLUMN longitude DOUBLE PRECISION DEFAULT 36.82;
    END IF;
END
$$;

-- Ensure resume_url column exists in applications table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'resume_url') THEN
        ALTER TABLE applications ADD COLUMN resume_url TEXT;
    END IF;
END
$$;

-- Create function to ensure payment_frequency column exists
CREATE OR REPLACE FUNCTION ensure_payment_frequency_column()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'payment_frequency') THEN
        ALTER TABLE jobs ADD COLUMN payment_frequency TEXT DEFAULT 'Monthly';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to ensure all required columns exist
CREATE OR REPLACE FUNCTION ensure_dashboard_compatibility()
RETURNS void AS $$
BEGIN
    -- Ensure payment_frequency column exists in jobs table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'payment_frequency') THEN
        ALTER TABLE jobs ADD COLUMN payment_frequency TEXT DEFAULT 'Monthly';
    END IF;
    
    -- Ensure latitude and longitude columns exist in jobs table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'latitude') THEN
        ALTER TABLE jobs ADD COLUMN latitude DOUBLE PRECISION DEFAULT -1.28;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'longitude') THEN
        ALTER TABLE jobs ADD COLUMN longitude DOUBLE PRECISION DEFAULT 36.82;
    END IF;
    
    -- Ensure resume_url column exists in applications table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'resume_url') THEN
        ALTER TABLE applications ADD COLUMN resume_url TEXT;
    END IF;
    
    -- Ensure dark_mode column exists in users table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'dark_mode') THEN
        ALTER TABLE users ADD COLUMN dark_mode BOOLEAN DEFAULT false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Run the function to ensure all columns exist
SELECT ensure_dashboard_compatibility();
