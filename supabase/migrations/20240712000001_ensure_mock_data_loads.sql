-- This migration ensures mock data is loaded properly

-- First, check if we have any jobs in the IT category
DO $$
DECLARE
  job_count INTEGER;
  employer_id UUID;
BEGIN
  -- Count IT jobs
  SELECT COUNT(*) INTO job_count FROM jobs WHERE category = 'IT';
  
  -- If no IT jobs exist, create them
  IF job_count = 0 THEN
    -- Get an employer ID
    SELECT id INTO employer_id FROM users WHERE role = 'employer' LIMIT 1;
    
    -- If no employer exists, exit
    IF employer_id IS NULL THEN
      RAISE NOTICE 'No employer found in the database. Cannot create mock jobs.';
      RETURN;
    END IF;
    
    -- Insert mock IT jobs
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
       
    RAISE NOTICE 'Created 5 mock IT jobs';
    
    -- Create mock notifications for a job seeker
    DECLARE
      job_seeker_id UUID;
    BEGIN
      -- Get a job seeker ID
      SELECT id INTO job_seeker_id FROM users WHERE role = 'job_seeker' LIMIT 1;
      
      IF job_seeker_id IS NOT NULL THEN
        -- Insert notifications
        INSERT INTO notifications (user_id, title, message, type, read, created_at, link)
        VALUES
          (job_seeker_id, 'New Job Match', 'A new Frontend Developer job matching your skills has been posted', 'job', FALSE, NOW() - INTERVAL '1 hour', '/dashboard/map-jobs'),
          (job_seeker_id, 'Application Update', 'Your application for Construction Worker has been reviewed', 'application', FALSE, NOW() - INTERVAL '3 hours', '/dashboard/my-applications'),
          (job_seeker_id, 'New Message', 'You have a new message from BuildRight Construction', 'message', FALSE, NOW() - INTERVAL '5 hours', '/dashboard/messages'),
          (employer_id, 'New Applicant', 'You have a new applicant for Frontend Developer position', 'application', FALSE, NOW() - INTERVAL '2 hours', '/dashboard/applicants'),
          (employer_id, 'New Message', 'You have a new message from a job applicant', 'message', FALSE, NOW() - INTERVAL '4 hours', '/dashboard/messages');
          
        RAISE NOTICE 'Created mock notifications';
      END IF;
    END;
  ELSE
    RAISE NOTICE 'Mock jobs already exist. Found % IT jobs.', job_count;
  END IF;
END;
$$;
