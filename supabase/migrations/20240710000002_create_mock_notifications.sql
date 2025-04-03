-- Add mock notifications for testing
INSERT INTO notifications (id, user_id, title, message, type, read, created_at, link)
VALUES
  -- For job seekers
  (gen_random_uuid(), (SELECT id FROM users WHERE role = 'job_seeker' LIMIT 1), 'New Job Match', 'A new Frontend Developer job matching your skills has been posted', 'job', false, NOW() - INTERVAL '1 hour', '/dashboard/map-jobs'),
  (gen_random_uuid(), (SELECT id FROM users WHERE role = 'job_seeker' LIMIT 1), 'Application Update', 'Your application for Construction Worker has been reviewed', 'application', false, NOW() - INTERVAL '3 hours', '/dashboard/my-applications'),
  (gen_random_uuid(), (SELECT id FROM users WHERE role = 'job_seeker' LIMIT 1), 'New Message', 'You have a new message from BuildRight Construction', 'message', false, NOW() - INTERVAL '5 hours', '/dashboard/messages'),
  (gen_random_uuid(), (SELECT id FROM users WHERE role = 'job_seeker' LIMIT 1), 'Interview Scheduled', 'Your interview for Retail Sales Associate has been scheduled', 'application', true, NOW() - INTERVAL '1 day', '/dashboard/my-applications'),
  (gen_random_uuid(), (SELECT id FROM users WHERE role = 'job_seeker' LIMIT 1), 'Application Accepted', 'Congratulations! Your application for Office Cleaner has been accepted', 'application', true, NOW() - INTERVAL '2 days', '/dashboard/my-applications'),
  
  -- For employers
  (gen_random_uuid(), (SELECT id FROM users WHERE role = 'employer' LIMIT 1), 'New Applicant', 'You have a new applicant for Frontend Developer position', 'application', false, NOW() - INTERVAL '2 hours', '/dashboard/applicants'),
  (gen_random_uuid(), (SELECT id FROM users WHERE role = 'employer' LIMIT 1), 'New Message', 'You have a new message from a job applicant', 'message', false, NOW() - INTERVAL '4 hours', '/dashboard/messages'),
  (gen_random_uuid(), (SELECT id FROM users WHERE role = 'employer' LIMIT 1), 'Job Posting Expiring', 'Your job posting for Security Guard will expire in 3 days', 'job', false, NOW() - INTERVAL '6 hours', '/dashboard/manage-jobs'),
  (gen_random_uuid(), (SELECT id FROM users WHERE role = 'employer' LIMIT 1), 'Payment Confirmation', 'Your payment for premium job listing has been confirmed', 'payment', true, NOW() - INTERVAL '1 day', '/dashboard/payments'),
  (gen_random_uuid(), (SELECT id FROM users WHERE role = 'employer' LIMIT 1), 'Profile View', 'Your company profile has been viewed 15 times this week', 'profile', true, NOW() - INTERVAL '3 days', '/dashboard/profile')
ON CONFLICT DO NOTHING;