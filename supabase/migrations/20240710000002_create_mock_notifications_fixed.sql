-- Add mock notifications for testing
INSERT INTO notifications (id, user_id, title, message, type, read, created_at, link)
SELECT
  gen_random_uuid(), 
  (SELECT id FROM users WHERE role = 'job_seeker' LIMIT 1), 
  'New Job Match', 
  'A new Frontend Developer job matching your skills has been posted', 
  'job', 
  false, 
  NOW() - INTERVAL '1 hour', 
  '/dashboard/map-jobs'
WHERE EXISTS (SELECT 1 FROM users WHERE role = 'job_seeker' LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'New Job Match' AND message = 'A new Frontend Developer job matching your skills has been posted');

INSERT INTO notifications (id, user_id, title, message, type, read, created_at, link)
SELECT
  gen_random_uuid(), 
  (SELECT id FROM users WHERE role = 'job_seeker' LIMIT 1), 
  'Application Update', 
  'Your application for Construction Worker has been reviewed', 
  'application', 
  false, 
  NOW() - INTERVAL '3 hours', 
  '/dashboard/my-applications'
WHERE EXISTS (SELECT 1 FROM users WHERE role = 'job_seeker' LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'Application Update' AND message = 'Your application for Construction Worker has been reviewed');

INSERT INTO notifications (id, user_id, title, message, type, read, created_at, link)
SELECT
  gen_random_uuid(), 
  (SELECT id FROM users WHERE role = 'job_seeker' LIMIT 1), 
  'New Message', 
  'You have a new message from BuildRight Construction', 
  'message', 
  false, 
  NOW() - INTERVAL '5 hours', 
  '/dashboard/messages'
WHERE EXISTS (SELECT 1 FROM users WHERE role = 'job_seeker' LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'New Message' AND message = 'You have a new message from BuildRight Construction');

INSERT INTO notifications (id, user_id, title, message, type, read, created_at, link)
SELECT
  gen_random_uuid(), 
  (SELECT id FROM users WHERE role = 'employer' LIMIT 1), 
  'New Applicant', 
  'You have a new applicant for Frontend Developer position', 
  'application', 
  false, 
  NOW() - INTERVAL '2 hours', 
  '/dashboard/applicants'
WHERE EXISTS (SELECT 1 FROM users WHERE role = 'employer' LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'New Applicant' AND message = 'You have a new applicant for Frontend Developer position');

INSERT INTO notifications (id, user_id, title, message, type, read, created_at, link)
SELECT
  gen_random_uuid(), 
  (SELECT id FROM users WHERE role = 'employer' LIMIT 1), 
  'New Message', 
  'You have a new message from a job applicant', 
  'message', 
  false, 
  NOW() - INTERVAL '4 hours', 
  '/dashboard/messages'
WHERE EXISTS (SELECT 1 FROM users WHERE role = 'employer' LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'New Message' AND message = 'You have a new message from a job applicant');