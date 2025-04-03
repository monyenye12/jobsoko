-- Add missing columns to jobs table if they don't exist
ALTER TABLE IF EXISTS jobs
ADD COLUMN IF NOT EXISTS payment_frequency TEXT,
ADD COLUMN IF NOT EXISTS salary_min INTEGER,
ADD COLUMN IF NOT EXISTS salary_max INTEGER,
ADD COLUMN IF NOT EXISTS salary_type TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS benefits TEXT[];

-- Create payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES users(id),
  job_id UUID REFERENCES jobs(id),
  applicant_id UUID REFERENCES users(id),
  amount DECIMAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'escrow')),
  payment_method TEXT,
  invoice_number TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES users(id),
  payment_id UUID REFERENCES payments(id),
  invoice_number TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'overdue')),
  due_date TIMESTAMP WITH TIME ZONE,
  issued_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  method_type TEXT NOT NULL CHECK (method_type IN ('credit_card', 'mpesa', 'paypal', 'bank_transfer')),
  is_default BOOLEAN DEFAULT false,
  last_four TEXT,
  provider TEXT,
  expiry_date TEXT,
  billing_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  job_id UUID REFERENCES jobs(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table to track unique conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_seeker_id UUID REFERENCES users(id),
  employer_id UUID REFERENCES users(id),
  job_id UUID REFERENCES jobs(id),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_seeker_id, employer_id, job_id)
);

-- Enable RLS on new tables
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Add policies for payments
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
CREATE POLICY "Users can view their own payments"
ON payments FOR SELECT
USING (employer_id = auth.uid() OR applicant_id = auth.uid());

DROP POLICY IF EXISTS "Employers can insert payments" ON payments;
CREATE POLICY "Employers can insert payments"
ON payments FOR INSERT
WITH CHECK (employer_id = auth.uid());

-- Add policies for invoices
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
CREATE POLICY "Users can view their own invoices"
ON invoices FOR SELECT
USING (employer_id = auth.uid());

-- Add policies for payment methods
DROP POLICY IF EXISTS "Users can view their own payment methods" ON payment_methods;
CREATE POLICY "Users can view their own payment methods"
ON payment_methods FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own payment methods" ON payment_methods;
CREATE POLICY "Users can insert their own payment methods"
ON payment_methods FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own payment methods" ON payment_methods;
CREATE POLICY "Users can update their own payment methods"
ON payment_methods FOR UPDATE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own payment methods" ON payment_methods;
CREATE POLICY "Users can delete their own payment methods"
ON payment_methods FOR DELETE
USING (user_id = auth.uid());

-- Add policies for messages
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
CREATE POLICY "Users can view their own messages"
ON messages FOR SELECT
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert messages" ON messages;
CREATE POLICY "Users can insert messages"
ON messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- Add policies for conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations"
ON conversations FOR SELECT
USING (job_seeker_id = auth.uid() OR employer_id = auth.uid());

-- Enable realtime for messages
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;

-- Insert sample data for testing
-- Sample payment methods
INSERT INTO payment_methods (user_id, method_type, is_default, last_four, provider, expiry_date)
SELECT 
  id, 'credit_card', true, '4242', 'Visa', '12/25'
FROM users
WHERE role = 'employer'
AND NOT EXISTS (SELECT 1 FROM payment_methods WHERE user_id = users.id AND method_type = 'credit_card')
LIMIT 5;

INSERT INTO payment_methods (user_id, method_type, is_default, provider)
SELECT 
  id, 'mpesa', false, 'Safaricom'
FROM users
WHERE role = 'employer'
AND NOT EXISTS (SELECT 1 FROM payment_methods WHERE user_id = users.id AND method_type = 'mpesa')
LIMIT 5;

-- Sample payments and invoices
DO $$
DECLARE
  employer_id uuid;
  job_id uuid;
  applicant_id uuid;
  payment_id uuid;
  invoice_number text;
BEGIN
  -- Get a sample employer
  SELECT id INTO employer_id FROM users WHERE role = 'employer' LIMIT 1;
  
  -- Get a sample job
  SELECT id INTO job_id FROM jobs WHERE employer_id = employer_id LIMIT 1;
  
  -- If no job exists, we can't create sample payments
  IF job_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Get a sample applicant
  SELECT id INTO applicant_id FROM users WHERE role = 'job_seeker' LIMIT 1;
  
  -- Create sample payments
  invoice_number := 'INV-' || to_char(NOW(), 'YYYYMMDD') || '-001';
  INSERT INTO payments (employer_id, job_id, applicant_id, amount, status, payment_method, invoice_number, description)
  VALUES (employer_id, job_id, applicant_id, 15000, 'completed', 'credit_card', invoice_number, 'Payment for completed job')
  RETURNING id INTO payment_id;
  
  -- Create corresponding invoice
  INSERT INTO invoices (employer_id, payment_id, invoice_number, amount, status, due_date, issued_date, paid_date)
  VALUES (employer_id, payment_id, invoice_number, 15000, 'paid', NOW() - interval '7 days', NOW() - interval '14 days', NOW() - interval '5 days');
  
  -- Create a pending payment
  invoice_number := 'INV-' || to_char(NOW(), 'YYYYMMDD') || '-002';
  INSERT INTO payments (employer_id, job_id, applicant_id, amount, status, payment_method, invoice_number, description)
  VALUES (employer_id, job_id, applicant_id, 8000, 'pending', 'mpesa', invoice_number, 'Advance payment for ongoing work')
  RETURNING id INTO payment_id;
  
  -- Create corresponding invoice
  INSERT INTO invoices (employer_id, payment_id, invoice_number, amount, status, due_date, issued_date)
  VALUES (employer_id, payment_id, invoice_number, 8000, 'pending', NOW() + interval '7 days', NOW() - interval '2 days');
  
  -- Create an escrow payment
  invoice_number := 'INV-' || to_char(NOW(), 'YYYYMMDD') || '-003';
  INSERT INTO payments (employer_id, job_id, applicant_id, amount, status, payment_method, invoice_number, description)
  VALUES (employer_id, job_id, applicant_id, 12000, 'escrow', 'credit_card', invoice_number, 'Funds held in escrow until job completion')
  RETURNING id INTO payment_id;
  
  -- Create corresponding invoice
  INSERT INTO invoices (employer_id, payment_id, invoice_number, amount, status, due_date, issued_date)
  VALUES (employer_id, payment_id, invoice_number, 12000, 'paid', NOW() - interval '10 days', NOW() - interval '15 days');
  
  -- Create an overdue invoice
  invoice_number := 'INV-' || to_char(NOW(), 'YYYYMMDD') || '-004';
  INSERT INTO payments (employer_id, job_id, applicant_id, amount, status, payment_method, invoice_number, description)
  VALUES (employer_id, job_id, applicant_id, 5000, 'pending', 'bank_transfer', invoice_number, 'Final payment for project completion')
  RETURNING id INTO payment_id;
  
  -- Create corresponding invoice
  INSERT INTO invoices (employer_id, payment_id, invoice_number, amount, status, due_date, issued_date)
  VALUES (employer_id, payment_id, invoice_number, 5000, 'overdue', NOW() - interval '5 days', NOW() - interval '20 days');
  
 END;
$$;

-- Sample messages and conversations
DO $$
DECLARE
  employer_id uuid;
  job_seeker_id uuid;
  job_id uuid;
  conversation_id uuid;
BEGIN
  -- Get a sample employer
  SELECT id INTO employer_id FROM users WHERE role = 'employer' LIMIT 1;
  
  -- Get a sample job seeker
  SELECT id INTO job_seeker_id FROM users WHERE role = 'job_seeker' LIMIT 1;
  
  -- Get a sample job
  SELECT id INTO job_id FROM jobs WHERE employer_id = employer_id LIMIT 1;
  
  -- If any of these don't exist, we can't create sample messages
  IF employer_id IS NULL OR job_seeker_id IS NULL OR job_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Create or get conversation
  INSERT INTO conversations (job_seeker_id, employer_id, job_id)
  VALUES (job_seeker_id, employer_id, job_id)
  ON CONFLICT (job_seeker_id, employer_id, job_id) DO UPDATE
  SET last_message_at = NOW()
  RETURNING id INTO conversation_id;
  
  -- Create sample messages
  INSERT INTO messages (sender_id, receiver_id, job_id, content, read, created_at)
  VALUES 
    (employer_id, job_seeker_id, job_id, 'Hello! I saw your application for the position. When would you be available for an interview?', true, NOW() - interval '3 days'),
    (job_seeker_id, employer_id, job_id, 'Hi! Thank you for considering my application. I am available any day this week between 2 PM and 5 PM.', true, NOW() - interval '2 days 23 hours'),
    (employer_id, job_seeker_id, job_id, 'Great! Let''s schedule for tomorrow at 3 PM. I''ll send you the meeting details shortly.', true, NOW() - interval '2 days 22 hours'),
    (job_seeker_id, employer_id, job_id, 'That works perfectly for me. Looking forward to our conversation!', true, NOW() - interval '2 days 21 hours'),
    (employer_id, job_seeker_id, job_id, 'I was impressed with your interview. I''d like to offer you the position. Can we discuss the details?', true, NOW() - interval '1 day'),
    (job_seeker_id, employer_id, job_id, 'That''s fantastic news! Yes, I''d be happy to discuss the details. What time works for you?', false, NOW() - interval '23 hours');
  
  -- Update conversation last message time
  UPDATE conversations
  SET last_message_at = NOW() - interval '23 hours'
  WHERE id = conversation_id;
  
 END;
$$;