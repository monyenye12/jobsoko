-- Fix missing columns in jobs table
ALTER TABLE IF EXISTS jobs
ADD COLUMN IF NOT EXISTS payment_frequency TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS benefits TEXT[],
ADD COLUMN IF NOT EXISTS application_methods TEXT[],
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'Public',
ADD COLUMN IF NOT EXISTS allow_messages BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_notifications BOOLEAN DEFAULT true;

-- Enable realtime for jobs table
alter publication supabase_realtime add table jobs;
