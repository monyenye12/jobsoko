-- Create a function to ensure the payment_frequency column exists
CREATE OR REPLACE FUNCTION ensure_payment_frequency_column()
RETURNS void AS $$
BEGIN
  -- Check if the column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'jobs' AND column_name = 'payment_frequency') THEN
    ALTER TABLE jobs ADD COLUMN payment_frequency TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;
