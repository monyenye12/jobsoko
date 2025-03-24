-- Ensure all necessary columns exist in the users table

-- Check if business_name column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'business_name') THEN
        ALTER TABLE users ADD COLUMN business_name TEXT;
    END IF;
END $$;

-- Check if business_type column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'business_type') THEN
        ALTER TABLE users ADD COLUMN business_type TEXT;
    END IF;
END $$;

-- Check if skills column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'skills') THEN
        ALTER TABLE users ADD COLUMN skills TEXT[];
    END IF;
END $$;

-- Check if preferred_category column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'preferred_category') THEN
        ALTER TABLE users ADD COLUMN preferred_category TEXT;
    END IF;
END $$;

-- Ensure the table is part of realtime
alter publication supabase_realtime add table users;
