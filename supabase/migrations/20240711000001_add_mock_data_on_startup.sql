-- Check if jobs table is empty before adding mock data
DO $$
DECLARE
  job_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO job_count FROM jobs;
  
  IF job_count = 0 THEN
    -- Insert mock job data
    INSERT INTO jobs (id, title, company, location, type, category, description, salary_min, salary_max, payment_frequency, skills, positions, work_hours, deadline, application_methods, contact_person, contact_phone, created_at, employer_id, status, urgent, latitude, longitude)
    VALUES
      -- Construction Jobs
      (gen_random_uuid(), 'Construction Site Manager', 'BuildRight Kenya', 'Nairobi, Kenya', 'Full-time', 'Construction', 'Oversee construction projects from planning to completion. Ensure safety standards and quality control.', 80000, 120000, 'month', ARRAY['Project Management', 'Construction', 'Safety Compliance'], 1, '8am-5pm Mon-Fri', (CURRENT_DATE + INTERVAL '30 days')::DATE, ARRAY['Apply through platform', 'Call for inquiry'], 'John Kamau', '+254712345678', NOW(), '00000000-0000-0000-0000-000000000001', 'active', true, -1.2921, 36.8219),
      
      (gen_random_uuid(), 'Skilled Mason', 'Mjengo Masters Ltd', 'Mombasa, Kenya', 'Full-time', 'Construction', 'Experienced mason needed for residential building projects. Must have at least 3 years experience.', 1200, 1800, 'day', ARRAY['Masonry', 'Construction', 'Bricklaying'], 5, '7am-4pm Mon-Sat', (CURRENT_DATE + INTERVAL '14 days')::DATE, ARRAY['Apply through platform', 'Visit office'], 'Sarah Ochieng', '+254723456789', NOW(), '00000000-0000-0000-0000-000000000002', 'active', false, -4.0435, 39.6682),
      
      (gen_random_uuid(), 'Construction Laborer', 'Simba Builders', 'Kisumu, Kenya', 'Full-time', 'Construction', 'General construction labor needed for commercial building project. Daily pay available.', 800, 1000, 'day', ARRAY['Manual Labor', 'Construction'], 10, '7am-5pm Mon-Sat', (CURRENT_DATE + INTERVAL '7 days')::DATE, ARRAY['Apply through platform', 'On-site interview'], 'Michael Otieno', '+254734567890', NOW(), '00000000-0000-0000-0000-000000000003', 'active', true, -0.1022, 34.7617),
      
      -- IT Jobs
      (gen_random_uuid(), 'Junior Web Developer', 'TechHub Kenya', 'Nairobi, Kenya', 'Full-time', 'IT', 'Entry-level web developer position. Knowledge of HTML, CSS, and JavaScript required.', 50000, 70000, 'month', ARRAY['HTML', 'CSS', 'JavaScript', 'React'], 2, '9am-5pm Mon-Fri', (CURRENT_DATE + INTERVAL '21 days')::DATE, ARRAY['Apply through platform', 'Email resume'], 'David Mwangi', '+254745678901', NOW(), '00000000-0000-0000-0000-000000000004', 'active', false, -1.2864, 36.8172),
      
      (gen_random_uuid(), 'IT Support Technician', 'Savannah Tech Solutions', 'Nakuru, Kenya', 'Full-time', 'IT', 'Provide technical support to office staff. Troubleshoot hardware and software issues.', 35000, 45000, 'month', ARRAY['IT Support', 'Windows', 'Networking'], 1, '8am-5pm Mon-Fri', (CURRENT_DATE + INTERVAL '14 days')::DATE, ARRAY['Apply through platform'], 'Grace Wanjiku', '+254756789012', NOW(), '00000000-0000-0000-0000-000000000005', 'active', false, -0.3031, 36.0800),
      
      -- Healthcare Jobs
      (gen_random_uuid(), 'Community Health Worker', 'Afya Health Services', 'Machakos, Kenya', 'Full-time', 'Healthcare', 'Work with local communities to promote health education and basic healthcare.', 25000, 35000, 'month', ARRAY['Healthcare', 'Community Outreach', 'First Aid'], 5, '8am-4pm Mon-Fri', (CURRENT_DATE + INTERVAL '10 days')::DATE, ARRAY['Apply through platform', 'Walk-in interview'], 'Joseph Mutua', '+254767890123', NOW(), '00000000-0000-0000-0000-000000000006', 'active', false, -1.5177, 37.2634),
      
      (gen_random_uuid(), 'Pharmacy Assistant', 'MediCare Pharmacy', 'Eldoret, Kenya', 'Part-time', 'Healthcare', 'Assist pharmacist with inventory management and customer service. Certificate in pharmacy required.', 20000, 25000, 'month', ARRAY['Pharmacy', 'Customer Service', 'Inventory Management'], 2, '9am-3pm Mon-Sat', (CURRENT_DATE + INTERVAL '14 days')::DATE, ARRAY['Apply through platform'], 'Elizabeth Chebet', '+254778901234', NOW(), '00000000-0000-0000-0000-000000000007', 'active', false, 0.5143, 35.2698),
      
      -- Retail Jobs
      (gen_random_uuid(), 'Retail Sales Associate', 'Fashion Express', 'Nairobi, Kenya', 'Full-time', 'Retail', 'Assist customers with product selection and process sales transactions.', 25000, 35000, 'month', ARRAY['Sales', 'Customer Service', 'Cash Handling'], 3, '9am-6pm (shifts)', (CURRENT_DATE + INTERVAL '7 days')::DATE, ARRAY['Apply through platform', 'Walk-in interview'], 'Patricia Njeri', '+254789012345', NOW(), '00000000-0000-0000-0000-000000000008', 'active', false, -1.2977, 36.7846),
      
      (gen_random_uuid(), 'Supermarket Cashier', 'QuickMart', 'Thika, Kenya', 'Part-time', 'Retail', 'Operate cash register and provide customer service at busy supermarket.', 800, 1000, 'day', ARRAY['Cash Handling', 'Customer Service'], 5, '7am-7pm (shifts)', (CURRENT_DATE + INTERVAL '5 days')::DATE, ARRAY['Apply through platform', 'Walk-in interview'], 'Robert Kamau', '+254790123456', NOW(), '00000000-0000-0000-0000-000000000009', 'active', true, -1.0396, 37.0900),
      
      -- Hospitality Jobs
      (gen_random_uuid(), 'Hotel Receptionist', 'Serena Hotel', 'Mombasa, Kenya', 'Full-time', 'Hospitality', 'Greet guests, manage reservations, and handle check-in/check-out procedures.', 30000, 40000, 'month', ARRAY['Customer Service', 'Reservation Systems', 'English'], 2, '7am-7pm (shifts)', (CURRENT_DATE + INTERVAL '14 days')::DATE, ARRAY['Apply through platform', 'Email resume'], 'James Omondi', '+254701234567', NOW(), '00000000-0000-0000-0000-000000000010', 'active', false, -4.0435, 39.6682),
      
      (gen_random_uuid(), 'Restaurant Server', 'Tasty Bites Restaurant', 'Nairobi, Kenya', 'Part-time', 'Hospitality', 'Take orders and serve food to customers. Previous experience preferred.', 900, 1200, 'day', ARRAY['Customer Service', 'Food Service'], 4, '10am-10pm (shifts)', (CURRENT_DATE + INTERVAL '7 days')::DATE, ARRAY['Apply through platform', 'Walk-in interview'], 'Mary Wambui', '+254712345678', NOW(), '00000000-0000-0000-0000-000000000011', 'active', false, -1.2921, 36.8219),
      
      -- Transportation Jobs
      (gen_random_uuid(), 'Delivery Driver', 'Swift Deliveries', 'Nairobi, Kenya', 'Full-time', 'Transportation', 'Deliver packages within the city. Must have valid driving license and know the city well.', 35000, 45000, 'month', ARRAY['Driving', 'Navigation', 'Customer Service'], 5, '8am-6pm Mon-Sat', (CURRENT_DATE + INTERVAL '10 days')::DATE, ARRAY['Apply through platform'], 'Daniel Kimani', '+254723456789', NOW(), '00000000-0000-0000-0000-000000000012', 'active', false, -1.3036, 36.7639),
      
      (gen_random_uuid(), 'Matatu Driver', 'City Hoppers', 'Kisumu, Kenya', 'Full-time', 'Transportation', 'Drive public service vehicle on established routes. PSV license required.', 1500, 2000, 'day', ARRAY['Driving', 'PSV License', 'Customer Service'], 3, '5am-7pm (shifts)', (CURRENT_DATE + INTERVAL '5 days')::DATE, ARRAY['Apply through platform', 'In-person interview'], 'Peter Odhiambo', '+254734567890', NOW(), '00000000-0000-0000-0000-000000000013', 'active', true, -0.1022, 34.7617),
      
      -- Education Jobs
      (gen_random_uuid(), 'Primary School Teacher', 'Bright Future Academy', 'Nakuru, Kenya', 'Full-time', 'Education', 'Teach primary school students. Degree in education required.', 35000, 45000, 'month', ARRAY['Teaching', 'Curriculum Development', 'Child Development'], 2, '7:30am-3:30pm Mon-Fri', (CURRENT_DATE + INTERVAL '21 days')::DATE, ARRAY['Apply through platform', 'Email resume'], 'Catherine Njoroge', '+254745678901', NOW(), '00000000-0000-0000-0000-000000000014', 'active', false, -0.3031, 36.0800),
      
      (gen_random_uuid(), 'Tutor', 'Excel Tutoring Center', 'Nairobi, Kenya', 'Part-time', 'Education', 'Tutor high school students in Mathematics and Sciences.', 500, 800, 'hour', ARRAY['Mathematics', 'Sciences', 'Teaching'], 5, 'Flexible hours', (CURRENT_DATE + INTERVAL '14 days')::DATE, ARRAY['Apply through platform'], 'Samuel Maina', '+254756789012', NOW(), '00000000-0000-0000-0000-000000000015', 'active', false, -1.2921, 36.8219),
      
      -- Manufacturing Jobs
      (gen_random_uuid(), 'Factory Worker', 'Kenya Manufacturing Ltd', 'Thika, Kenya', 'Full-time', 'Manufacturing', 'General factory work in food processing plant. No experience necessary.', 25000, 30000, 'month', ARRAY['Manual Labor', 'Food Processing'], 10, '7am-7pm (shifts)', (CURRENT_DATE + INTERVAL '7 days')::DATE, ARRAY['Apply through platform', 'Walk-in interview'], 'George Mwangi', '+254767890123', NOW(), '00000000-0000-0000-0000-000000000016', 'active', true, -1.0396, 37.0900),
      
      (gen_random_uuid(), 'Quality Control Inspector', 'Premier Products Kenya', 'Athi River, Kenya', 'Full-time', 'Manufacturing', 'Inspect products for quality and compliance with standards.', 35000, 45000, 'month', ARRAY['Quality Control', 'Attention to Detail'], 2, '8am-5pm Mon-Fri', (CURRENT_DATE + INTERVAL '14 days')::DATE, ARRAY['Apply through platform'], 'Jane Kamau', '+254778901234', NOW(), '00000000-0000-0000-0000-000000000017', 'active', false, -1.4569, 36.9780),
      
      -- Agriculture Jobs
      (gen_random_uuid(), 'Farm Worker', 'Green Acres Farm', 'Naivasha, Kenya', 'Full-time', 'Agriculture', 'General farm work including planting, harvesting, and animal care.', 800, 1000, 'day', ARRAY['Farming', 'Manual Labor', 'Animal Care'], 15, '6am-4pm Mon-Sat', (CURRENT_DATE + INTERVAL '5 days')::DATE, ARRAY['Apply through platform', 'On-site interview'], 'Stephen Kariuki', '+254789012345', NOW(), '00000000-0000-0000-0000-000000000018', 'active', false, -0.7129, 36.4316),
      
      (gen_random_uuid(), 'Greenhouse Attendant', 'Fresh Produce Kenya', 'Limuru, Kenya', 'Full-time', 'Agriculture', 'Monitor and maintain greenhouse conditions for optimal plant growth.', 25000, 30000, 'month', ARRAY['Greenhouse Management', 'Plant Care'], 3, '7am-4pm Mon-Sat', (CURRENT_DATE + INTERVAL '10 days')::DATE, ARRAY['Apply through platform'], 'Lucy Wanjiru', '+254790123456', NOW(), '00000000-0000-0000-0000-000000000019', 'active', false, -1.1136, 36.6421),
      
      -- Security Jobs
      (gen_random_uuid(), 'Security Guard', 'Secure Solutions', 'Nairobi, Kenya', 'Full-time', 'Security', 'Provide security services for commercial building. Day and night shifts available.', 25000, 35000, 'month', ARRAY['Security', 'Surveillance', 'Customer Service'], 5, '12-hour shifts', (CURRENT_DATE + INTERVAL '7 days')::DATE, ARRAY['Apply through platform', 'In-person interview'], 'Paul Otieno', '+254701234567', NOW(), '00000000-0000-0000-0000-000000000020', 'active', true, -1.2921, 36.8219),
      
      (gen_random_uuid(), 'Night Watchman', 'Guardian Services', 'Mombasa, Kenya', 'Full-time', 'Security', 'Provide overnight security for residential compound.', 20000, 25000, 'month', ARRAY['Security', 'Night Shift'], 3, '6pm-6am', (CURRENT_DATE + INTERVAL '5 days')::DATE, ARRAY['Apply through platform'], 'Thomas Ochieng', '+254712345678', NOW(), '00000000-0000-0000-0000-000000000021', 'active', false, -4.0435, 39.6682),
      
      -- Cleaning Jobs
      (gen_random_uuid(), 'Office Cleaner', 'CleanPro Services', 'Nairobi, Kenya', 'Part-time', 'Cleaning', 'Clean office spaces after business hours.', 700, 900, 'day', ARRAY['Cleaning', 'Janitorial Services'], 5, '5pm-9pm Mon-Fri', (CURRENT_DATE + INTERVAL '7 days')::DATE, ARRAY['Apply through platform', 'Walk-in interview'], 'Grace Muthoni', '+254723456789', NOW(), '00000000-0000-0000-0000-000000000022', 'active', false, -1.2921, 36.8219),
      
      (gen_random_uuid(), 'Domestic Worker', 'HomeCare Agency', 'Karen, Nairobi', 'Full-time', 'Cleaning', 'Provide cleaning and household management services for private residence.', 15000, 25000, 'month', ARRAY['Cleaning', 'Cooking', 'Childcare'], 1, '7am-5pm Mon-Sat', (CURRENT_DATE + INTERVAL '10 days')::DATE, ARRAY['Apply through platform'], 'Sarah Njeri', '+254734567890', NOW(), '00000000-0000-0000-0000-000000000023', 'active', false, -1.3294, 36.7185),
      
      -- Driving Jobs
      (gen_random_uuid(), 'Personal Driver', 'Executive Transport', 'Nairobi, Kenya', 'Full-time', 'Driving', 'Drive for business executive. Clean driving record required.', 35000, 45000, 'month', ARRAY['Driving', 'Customer Service', 'Navigation'], 1, '7am-7pm Mon-Fri', (CURRENT_DATE + INTERVAL '14 days')::DATE, ARRAY['Apply through platform', 'In-person interview'], 'James Mwangi', '+254745678901', NOW(), '00000000-0000-0000-0000-000000000024', 'active', false, -1.2921, 36.8219),
      
      (gen_random_uuid(), 'Truck Driver', 'Logistics Kenya Ltd', 'Mombasa, Kenya', 'Full-time', 'Driving', 'Drive delivery truck for long-distance routes. Class C license required.', 50000, 70000, 'month', ARRAY['Driving', 'Logistics', 'Heavy Vehicle License'], 3, 'Variable schedule', (CURRENT_DATE + INTERVAL '10 days')::DATE, ARRAY['Apply through platform'], 'Peter Kamau', '+254756789012', NOW(), '00000000-0000-0000-0000-000000000025', 'active', true, -4.0435, 39.6682),
      
      -- Additional Jobs
      (gen_random_uuid(), 'Warehouse Assistant', 'Global Logistics', 'Nairobi, Kenya', 'Full-time', 'Logistics', 'Assist with inventory management and order fulfillment in busy warehouse.', 25000, 35000, 'month', ARRAY['Inventory Management', 'Physical Stamina', 'Organization'], 3, '8am-5pm Mon-Fri', (CURRENT_DATE + INTERVAL '14 days')::DATE, ARRAY['Apply through platform'], 'David Njoroge', '+254767890123', NOW(), '00000000-0000-0000-0000-000000000026', 'active', false, -1.3167, 36.9254),
      
      (gen_random_uuid(), 'Call Center Agent', 'Customer Connect', 'Nairobi, Kenya', 'Full-time', 'Customer Service', 'Handle customer inquiries via phone and email. Good communication skills required.', 30000, 40000, 'month', ARRAY['Customer Service', 'Communication', 'Problem Solving'], 5, '8am-8pm (shifts)', (CURRENT_DATE + INTERVAL '7 days')::DATE, ARRAY['Apply through platform', 'Phone interview'], 'Nancy Wambui', '+254778901234', NOW(), '00000000-0000-0000-0000-000000000027', 'active', false, -1.2921, 36.8219),
      
      (gen_random_uuid(), 'Solar Panel Installer', 'Green Energy Solutions', 'Machakos, Kenya', 'Full-time', 'Construction', 'Install solar panels on residential and commercial buildings.', 40000, 60000, 'month', ARRAY['Solar Installation', 'Electrical Work', 'Construction'], 2, '8am-5pm Mon-Fri', (CURRENT_DATE + INTERVAL '21 days')::DATE, ARRAY['Apply through platform'], 'Joseph Mutinda', '+254789012345', NOW(), '00000000-0000-0000-0000-000000000028', 'active', false, -1.5177, 37.2634),
      
      (gen_random_uuid(), 'Barber', 'Modern Cuts', 'Kisumu, Kenya', 'Full-time', 'Personal Services', 'Provide haircuts and grooming services. Experience required.', 1000, 1500, 'day', ARRAY['Barbering', 'Customer Service', 'Grooming'], 1, '9am-7pm Tue-Sun', (CURRENT_DATE + INTERVAL '5 days')::DATE, ARRAY['Apply through platform', 'In-person interview'], 'Michael Onyango', '+254790123456', NOW(), '00000000-0000-0000-0000-000000000029', 'active', false, -0.1022, 34.7617),
      
      (gen_random_uuid(), 'Salon Stylist', 'Beauty Haven', 'Nairobi, Kenya', 'Full-time', 'Personal Services', 'Provide hair styling and beauty services. Certificate in beauty therapy preferred.', 25000, 40000, 'month', ARRAY['Hair Styling', 'Beauty Services', 'Customer Service'], 2, '9am-7pm Tue-Sun', (CURRENT_DATE + INTERVAL '10 days')::DATE, ARRAY['Apply through platform'], 'Elizabeth Njeri', '+254701234567', NOW(), '00000000-0000-0000-0000-000000000030', 'active', false, -1.2921, 36.8219),
      
      (gen_random_uuid(), 'Electrician', 'Power Solutions', 'Nakuru, Kenya', 'Full-time', 'Construction', 'Install and repair electrical systems in residential and commercial buildings.', 1500, 2500, 'day', ARRAY['Electrical Work', 'Wiring', 'Troubleshooting'], 2, '8am-5pm Mon-Fri', (CURRENT_DATE + INTERVAL '14 days')::DATE, ARRAY['Apply through platform', 'In-person interview'], 'Robert Kiprop', '+254712345678', NOW(), '00000000-0000-0000-0000-000000000031', 'active', true, -0.3031, 36.0800),
      
      (gen_random_uuid(), 'Plumber', 'Water Works', 'Eldoret, Kenya', 'Full-time', 'Construction', 'Install and repair plumbing systems. Experience required.', 1200, 2000, 'day', ARRAY['Plumbing', 'Pipe Fitting', 'Troubleshooting'], 1, '8am-5pm Mon-Fri', (CURRENT_DATE + INTERVAL '7 days')::DATE, ARRAY['Apply through platform'], 'Samuel Kiptoo', '+254723456789', NOW(), '00000000-0000-0000-0000-000000000032', 'active', false, 0.5143, 35.2698),
      
      (gen_random_uuid(), 'Carpenter', 'Woodcraft Furniture', 'Nairobi, Kenya', 'Full-time', 'Construction', 'Build and repair wooden structures and furniture. Experience required.', 1200, 2000, 'day', ARRAY['Carpentry', 'Woodworking', 'Furniture Making'], 2, '8am-5pm Mon-Fri', (CURRENT_DATE + INTERVAL '10 days')::DATE, ARRAY['Apply through platform', 'In-person interview'], 'John Mwangi', '+254734567890', NOW(), '00000000-0000-0000-0000-000000000033', 'active', false, -1.2921, 36.8219),
      
      (gen_random_uuid(), 'Painter', 'Color Masters', 'Mombasa, Kenya', 'Full-time', 'Construction', 'Paint interior and exterior of buildings. Experience preferred.', 1000, 1500, 'day', ARRAY['Painting', 'Surface Preparation'], 3, '8am-5pm Mon-Sat', (CURRENT_DATE + INTERVAL '5 days')::DATE, ARRAY['Apply through platform'], 'Ali Hassan', '+254745678901', NOW(), '00000000-0000-0000-0000-000000000034', 'active', false, -4.0435, 39.6682),
      
      (gen_random_uuid(), 'Gardener', 'Green Thumbs', 'Karen, Nairobi', 'Part-time', 'Agriculture', 'Maintain gardens and landscapes for residential properties.', 800, 1200, 'day', ARRAY['Gardening', 'Landscaping', 'Plant Care'], 2, '7am-3pm Mon-Fri', (CURRENT_DATE + INTERVAL '7 days')::DATE, ARRAY['Apply through platform'], 'Grace Wangari', '+254756789012', NOW(), '00000000-0000-0000-0000-000000000035', 'active', false, -1.3294, 36.7185),
      
      (gen_random_uuid(), 'Tailor', 'Fashion Creations', 'Nairobi, Kenya', 'Full-time', 'Manufacturing', 'Create and alter clothing. Experience with various fabrics required.', 30000, 45000, 'month', ARRAY['Sewing', 'Pattern Making', 'Alterations'], 1, '9am-6pm Mon-Sat', (CURRENT_DATE + INTERVAL '14 days')::DATE, ARRAY['Apply through platform', 'In-person interview'], 'Mary Njoki', '+254767890123', NOW(), '00000000-0000-0000-0000-000000000036', 'active', false, -1.2921, 36.8219),
      
      (gen_random_uuid(), 'Mechanic', 'Auto Fix Garage', 'Nakuru, Kenya', 'Full-time', 'Automotive', 'Repair and maintain vehicles. Experience required.', 35000, 50000, 'month', ARRAY['Auto Repair', 'Diagnostics', 'Mechanical Skills'], 2, '8am-6pm Mon-Sat', (CURRENT_DATE + INTERVAL '10 days')::DATE, ARRAY['Apply through platform'], 'Peter Njoroge', '+254778901234', NOW(), '00000000-0000-0000-0000-000000000037', 'active', true, -0.3031, 36.0800),
      
      (gen_random_uuid(), 'Motorcycle Delivery Rider', 'Speedy Deliveries', 'Nairobi, Kenya', 'Full-time', 'Transportation', 'Deliver packages within the city using a motorcycle. Must have valid license.', 30000, 40000, 'month', ARRAY['Driving', 'Navigation', 'Time Management'], 5, '8am-6pm (shifts)', (CURRENT_DATE + INTERVAL '5 days')::DATE, ARRAY['Apply through platform', 'In-person interview'], 'James Kamau', '+254789012345', NOW(), '00000000-0000-0000-0000-000000000038', 'active', true, -1.2921, 36.8219),
      
      (gen_random_uuid(), 'Sales Representative', 'Consumer Products Ltd', 'Kisumu, Kenya', 'Full-time', 'Sales', 'Promote and sell company products to retail stores. Sales experience preferred.', 25000, 40000, 'month', ARRAY['Sales', 'Negotiation', 'Customer Relations'], 3, '8am-5pm Mon-Fri', (CURRENT_DATE + INTERVAL '14 days')::DATE, ARRAY['Apply through platform'], 'Sarah Achieng', '+254790123456', NOW(), '00000000-0000-0000-0000-000000000039', 'active', false, -0.1022, 34.7617),
      
      (gen_random_uuid(), 'Receptionist', 'Corporate Office Center', 'Nairobi, Kenya', 'Full-time', 'Administrative', 'Greet visitors and manage front desk operations. Good communication skills required.', 25000, 35000, 'month', ARRAY['Reception', 'Administrative Support', 'Customer Service'], 1, '8am-5pm Mon-Fri', (CURRENT_DATE + INTERVAL '7 days')::DATE, ARRAY['Apply through platform', 'In-person interview'], 'Jane Wambui', '+254701234567', NOW(), '00000000-0000-0000-0000-000000000040', 'active', false, -1.2921, 36.8219);
  END IF;
END $$;