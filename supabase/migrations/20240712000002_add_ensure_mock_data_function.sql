-- Create a function to ensure mock data exists
CREATE OR REPLACE FUNCTION ensure_mock_data_exists()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  job_count INTEGER;
  employer_id UUID;
  job_seeker_id UUID;
BEGIN
  -- Count jobs
  SELECT COUNT(*) INTO job_count FROM jobs;
  
  -- If no jobs exist, create them
  IF job_count = 0 THEN
    -- Get an employer ID
    SELECT id INTO employer_id FROM users WHERE role = 'employer' LIMIT 1;
    
    -- If no employer exists, create one
    IF employer_id IS NULL THEN
      INSERT INTO users (email, full_name, role, business_name, location, created_at)
      VALUES ('employer@example.com', 'Demo Employer', 'employer', 'Demo Company', 'Nairobi, Kenya', NOW())
      RETURNING id INTO employer_id;
    END IF;
    
    -- Get a job seeker ID
    SELECT id INTO job_seeker_id FROM users WHERE role = 'job_seeker' LIMIT 1;
    
    -- If no job seeker exists, create one
    IF job_seeker_id IS NULL THEN
      INSERT INTO users (email, full_name, role, location, skills, created_at)
      VALUES ('jobseeker@example.com', 'Demo Job Seeker', 'job_seeker', 'Nairobi, Kenya', ARRAY['JavaScript', 'React', 'Node.js'], NOW())
      RETURNING id INTO job_seeker_id;
    END IF;
    
    -- Insert mock jobs
    INSERT INTO jobs (title, company, location, type, category, description, salary_min, salary_max, 
                     salary_type, payment_frequency, payment_method, benefits, skills, positions, 
                     work_hours, is_remote, deadline, application_methods, contact_person, 
                     contact_phone, created_at, employer_id, status, urgent, latitude, longitude)
    VALUES
      ('Frontend Developer', 'TechSolutions Ltd', 'Nairobi, Kenya', 'Full-time', 'IT', 
       'We are looking for a skilled Frontend Developer to join our team. The ideal candidate should have experience with React, TypeScript, and modern CSS frameworks.', 
       80000, 120000, 'Range', 'Monthly', 'Bank Transfer', 
       ARRAY['Transport allowance', 'Meals', 'Insurance'], 
       ARRAY['React', 'TypeScript', 'CSS', 'JavaScript'], 
       2, '9 AM - 5 PM, Monday to Friday', TRUE, 
       (CURRENT_DATE + INTERVAL '90 days')::DATE, 
       ARRAY['Apply Directly via JobSoko', 'Submit CV & Cover Letter'], 
       'John Doe', '+254712345678', NOW(), employer_id, 'active', FALSE, -1.2921, 36.8219),
       
      ('Backend Developer', 'DataTech Systems', 'Mombasa, Kenya', 'Full-time', 'IT', 
       'Looking for a Backend Developer with experience in Node.js, Express, and MongoDB. Must be able to design and implement scalable APIs.', 
       90000, 130000, 'Range', 'Monthly', 'Bank Transfer', 
       ARRAY['Transport allowance', 'Insurance', 'Bonuses'], 
       ARRAY['Node.js', 'Express', 'MongoDB', 'API Design'], 
       1, '8 AM - 4 PM, Monday to Friday', FALSE, 
       (CURRENT_DATE + INTERVAL '60 days')::DATE, 
       ARRAY['Apply Directly via JobSoko', 'Submit CV & Cover Letter'], 
       'Jane Smith', '+254723456789', NOW(), employer_id, 'active', FALSE, -4.0435, 39.6682),
       
      ('Mobile App Developer', 'AppWorks Kenya', 'Kisumu, Kenya', 'Contract', 'IT', 
       'Seeking a Mobile App Developer with experience in React Native or Flutter. The project involves building a fintech application for the Kenyan market.', 
       70000, 100000, 'Range', 'Monthly', 'Mobile Money (M-Pesa, Airtel Money, etc.)', 
       ARRAY['Flexible hours', 'Remote work options'], 
       ARRAY['React Native', 'Flutter', 'Mobile Development', 'API Integration'], 
       2, 'Flexible hours', TRUE, 
       (CURRENT_DATE + INTERVAL '45 days')::DATE, 
       ARRAY['Apply Directly via JobSoko', 'Submit CV & Cover Letter'], 
       'Michael Ochieng', '+254734567890', NOW(), employer_id, 'active', TRUE, -0.1022, 34.7617),
       
      ('Data Scientist', 'Analytics Africa', 'Nairobi, Kenya', 'Full-time', 'Data Science', 
       'We are looking for a Data Scientist to analyze large datasets and build predictive models. Experience with Python, R, and machine learning required.', 
       100000, 150000, 'Range', 'Monthly', 'Bank Transfer', 
       ARRAY['Transport allowance', 'Meals', 'Insurance', 'Bonuses'], 
       ARRAY['Python', 'R', 'Machine Learning', 'Data Analysis'], 
       1, '9 AM - 5 PM, Monday to Friday', FALSE, 
       (CURRENT_DATE + INTERVAL '75 days')::DATE, 
       ARRAY['Apply Directly via JobSoko', 'Submit CV & Cover Letter'], 
       'Sarah Kamau', '+254745678901', NOW(), employer_id, 'active', FALSE, -1.2864, 36.8172),
       
      ('Cybersecurity Analyst', 'SecureNet Kenya', 'Nairobi, Kenya', 'Full-time', 'Cybersecurity', 
       'Looking for a Cybersecurity Analyst to help protect our systems from threats. Experience with penetration testing and security audits required.', 
       90000, 130000, 'Range', 'Monthly', 'Bank Transfer', 
       ARRAY['Transport allowance', 'Meals', 'Insurance', 'Bonuses'], 
       ARRAY['Cybersecurity', 'Penetration Testing', 'Security Audits', 'Threat Analysis'], 
       1, '9 AM - 5 PM, Monday to Friday', FALSE, 
       (CURRENT_DATE + INTERVAL '30 days')::DATE, 
       ARRAY['Apply Directly via JobSoko', 'Submit CV & Cover Letter'], 
       'Lucy Njeri', '+254767890123', NOW(), employer_id, 'active', TRUE, -1.2933, 36.8172);
       
    -- Insert notifications
    INSERT INTO notifications (user_id, title, message, type, read, created_at, link)
    VALUES
      (job_seeker_id, 'New Job Match', 'A new Frontend Developer job matching your skills has been posted', 'job', FALSE, NOW() - INTERVAL '1 hour', '/dashboard/map-jobs'),
      (job_seeker_id, 'Application Update', 'Your application for Construction Worker has been reviewed', 'application', FALSE, NOW() - INTERVAL '3 hours', '/dashboard/my-applications'),
      (job_seeker_id, 'New Message', 'You have a new message from BuildRight Construction', 'message', FALSE, NOW() - INTERVAL '5 hours', '/dashboard/messages'),
      (employer_id, 'New Applicant', 'You have a new applicant for Frontend Developer position', 'application', FALSE, NOW() - INTERVAL '2 hours', '/dashboard/applicants'),
      (employer_id, 'New Message', 'You have a new message from a job applicant', 'message', FALSE, NOW() - INTERVAL '4 hours', '/dashboard/messages');
  END IF;
END;
$$;
