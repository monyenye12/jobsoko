-- Ensure the role column exists in the users table and has proper constraints
DO $$ 
BEGIN
  -- Check if the role column exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'role') THEN
    -- Add the role column if it doesn't exist
    ALTER TABLE users ADD COLUMN role TEXT;
  END IF;

  -- Add a check constraint to ensure role is either 'job_seeker' or 'employer'
  -- First drop the constraint if it exists
  BEGIN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
  EXCEPTION WHEN OTHERS THEN
    -- Constraint doesn't exist, continue
  END;
  
  -- Add the constraint
  ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('job_seeker', 'employer', 'admin'));

  -- Set default value for role if null
  UPDATE users SET role = 'job_seeker' WHERE role IS NULL;

  -- Make role column NOT NULL
  ALTER TABLE users ALTER COLUMN role SET NOT NULL;

END $$;
