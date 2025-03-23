-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,  -- Can be job_id, application_id, etc.
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table notifications;

-- Create functions for notifications

-- Function to create notification when a job application is submitted
CREATE OR REPLACE FUNCTION notify_job_application()
RETURNS TRIGGER AS $$
DECLARE
  job_title TEXT;
  employer_id UUID;
BEGIN
  -- Get job title and employer_id
  SELECT title, employer_id INTO job_title, employer_id
  FROM jobs
  WHERE id = NEW.job_id;
  
  -- Create notification for employer
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    employer_id,
    'application',
    'New Job Application',
    'Someone applied for your job: ' || job_title,
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for job application notifications
DROP TRIGGER IF EXISTS notify_job_application_trigger ON applications;
CREATE TRIGGER notify_job_application_trigger
AFTER INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION notify_job_application();

-- Function to create notification when application status changes
CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
  job_title TEXT;
BEGIN
  IF NEW.status <> OLD.status THEN
    -- Get job title
    SELECT title INTO job_title
    FROM jobs
    WHERE id = NEW.job_id;
    
    -- Create notification for applicant
    INSERT INTO notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.applicant_id,
      'status_change',
      'Application Status Updated',
      'Your application for ' || job_title || ' is now ' || NEW.status,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for application status change notifications
DROP TRIGGER IF EXISTS notify_application_status_change_trigger ON applications;
CREATE TRIGGER notify_application_status_change_trigger
AFTER UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION notify_application_status_change();

-- Function to create notification when a new job is posted
CREATE OR REPLACE FUNCTION notify_new_job()
RETURNS TRIGGER AS $$
DECLARE
  user_record RECORD;
  job_location TEXT;
BEGIN
  -- Get job location
  job_location := NEW.location;
  
  -- Create notifications for job seekers with matching preferred category
  FOR user_record IN (
    SELECT id
    FROM users
    WHERE role = 'job_seeker'
    AND (preferred_category = NEW.category OR preferred_category IS NULL)
  ) LOOP
    INSERT INTO notifications (user_id, type, title, message, related_id)
    VALUES (
      user_record.id,
      'new_job',
      'New Job Available',
      'A new ' || NEW.category || ' job is available in ' || job_location,
      NEW.id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new job notifications
DROP TRIGGER IF EXISTS notify_new_job_trigger ON jobs;
CREATE TRIGGER notify_new_job_trigger
AFTER INSERT ON jobs
FOR EACH ROW
EXECUTE FUNCTION notify_new_job();
