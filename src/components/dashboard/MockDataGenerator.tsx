import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function MockDataGenerator() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateMockJobs = async () => {
    setLoading(true);
    try {
      // First check if we already have IT jobs
      const { data: existingJobs } = await supabase
        .from("jobs")
        .select("id, category")
        .eq("category", "IT");

      if (existingJobs && existingJobs.length > 0) {
        toast({
          title: "Mock jobs already exist",
          description: `Found ${existingJobs.length} IT jobs in the database.`,
        });
        setLoading(false);
        return;
      }

      // Get an employer ID
      const { data: employers } = await supabase
        .from("users")
        .select("id")
        .eq("role", "employer")
        .limit(1);

      if (!employers || employers.length === 0) {
        throw new Error("No employers found in the database");
      }

      const employerId = employers[0].id;

      // Create IT jobs
      const mockJobs = [
        {
          title: "Frontend Developer",
          company: "TechSolutions Ltd",
          location: "Nairobi, Kenya",
          type: "Full-time",
          category: "IT",
          description:
            "We are looking for a skilled Frontend Developer to join our team. The ideal candidate should have experience with React, TypeScript, and modern CSS frameworks.",
          salary_min: 80000,
          salary_max: 120000,
          salary_type: "Range",
          payment_frequency: "Monthly",
          payment_method: "Bank Transfer",
          benefits: ["Transport allowance", "Meals", "Insurance"],
          skills: ["React", "TypeScript", "CSS", "JavaScript"],
          positions: 2,
          work_hours: "9 AM - 5 PM, Monday to Friday",
          is_remote: true,
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // 90 days from now
          application_methods: [
            "Apply Directly via JobSoko",
            "Submit CV & Cover Letter",
          ],
          contact_person: "John Doe",
          contact_phone: "+254712345678",
          created_at: new Date().toISOString(),
          employer_id: employerId,
          status: "active",
          urgent: false,
          latitude: -1.2921,
          longitude: 36.8219,
        },
        {
          title: "Backend Developer",
          company: "DataTech Systems",
          location: "Mombasa, Kenya",
          type: "Full-time",
          category: "IT",
          description:
            "Looking for a Backend Developer with experience in Node.js, Express, and MongoDB. Must be able to design and implement scalable APIs.",
          salary_min: 90000,
          salary_max: 130000,
          salary_type: "Range",
          payment_frequency: "Monthly",
          payment_method: "Bank Transfer",
          benefits: ["Transport allowance", "Insurance", "Bonuses"],
          skills: ["Node.js", "Express", "MongoDB", "API Design"],
          positions: 1,
          work_hours: "8 AM - 4 PM, Monday to Friday",
          is_remote: false,
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // 60 days from now
          application_methods: [
            "Apply Directly via JobSoko",
            "Submit CV & Cover Letter",
          ],
          contact_person: "Jane Smith",
          contact_phone: "+254723456789",
          created_at: new Date().toISOString(),
          employer_id: employerId,
          status: "active",
          urgent: false,
          latitude: -4.0435,
          longitude: 39.6682,
        },
        {
          title: "Mobile App Developer",
          company: "AppWorks Kenya",
          location: "Kisumu, Kenya",
          type: "Contract",
          category: "IT",
          description:
            "Seeking a Mobile App Developer with experience in React Native or Flutter. The project involves building a fintech application for the Kenyan market.",
          salary_min: 70000,
          salary_max: 100000,
          salary_type: "Range",
          payment_frequency: "Monthly",
          payment_method: "Mobile Money (M-Pesa, Airtel Money, etc.)",
          benefits: ["Flexible hours", "Remote work options"],
          skills: [
            "React Native",
            "Flutter",
            "Mobile Development",
            "API Integration",
          ],
          positions: 2,
          work_hours: "Flexible hours",
          is_remote: true,
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // 45 days from now
          application_methods: [
            "Apply Directly via JobSoko",
            "Submit CV & Cover Letter",
          ],
          contact_person: "Michael Ochieng",
          contact_phone: "+254734567890",
          created_at: new Date().toISOString(),
          employer_id: employerId,
          status: "active",
          urgent: true,
          latitude: -0.1022,
          longitude: 34.7617,
        },
        {
          title: "Data Scientist",
          company: "Analytics Africa",
          location: "Nairobi, Kenya",
          type: "Full-time",
          category: "Data Science",
          description:
            "We are looking for a Data Scientist to analyze large datasets and build predictive models. Experience with Python, R, and machine learning required.",
          salary_min: 100000,
          salary_max: 150000,
          salary_type: "Range",
          payment_frequency: "Monthly",
          payment_method: "Bank Transfer",
          benefits: ["Transport allowance", "Meals", "Insurance", "Bonuses"],
          skills: ["Python", "R", "Machine Learning", "Data Analysis"],
          positions: 1,
          work_hours: "9 AM - 5 PM, Monday to Friday",
          is_remote: false,
          deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // 75 days from now
          application_methods: [
            "Apply Directly via JobSoko",
            "Submit CV & Cover Letter",
          ],
          contact_person: "Sarah Kamau",
          contact_phone: "+254745678901",
          created_at: new Date().toISOString(),
          employer_id: employerId,
          status: "active",
          urgent: false,
          latitude: -1.2864,
          longitude: 36.8172,
        },
        {
          title: "Cybersecurity Analyst",
          company: "SecureNet Kenya",
          location: "Nairobi, Kenya",
          type: "Full-time",
          category: "Cybersecurity",
          description:
            "Looking for a Cybersecurity Analyst to help protect our systems from threats. Experience with penetration testing and security audits required.",
          salary_min: 90000,
          salary_max: 130000,
          salary_type: "Range",
          payment_frequency: "Monthly",
          payment_method: "Bank Transfer",
          benefits: ["Transport allowance", "Meals", "Insurance", "Bonuses"],
          skills: [
            "Cybersecurity",
            "Penetration Testing",
            "Security Audits",
            "Threat Analysis",
          ],
          positions: 1,
          work_hours: "9 AM - 5 PM, Monday to Friday",
          is_remote: false,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // 30 days from now
          application_methods: [
            "Apply Directly via JobSoko",
            "Submit CV & Cover Letter",
          ],
          contact_person: "Lucy Njeri",
          contact_phone: "+254767890123",
          created_at: new Date().toISOString(),
          employer_id: employerId,
          status: "active",
          urgent: true,
          latitude: -1.2933,
          longitude: 36.8172,
        },
      ];

      // Insert jobs
      const { error: jobsError } = await supabase.from("jobs").insert(mockJobs);

      if (jobsError) throw jobsError;

      // Generate mock notifications
      await generateMockNotifications();

      toast({
        title: "Success",
        description: `Created ${mockJobs.length} mock IT jobs and notifications.`,
      });
    } catch (error) {
      console.error("Error generating mock data:", error);
      toast({
        title: "Error",
        description: "Failed to generate mock data. See console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockNotifications = async () => {
    try {
      // Get a job seeker ID
      const { data: jobSeekers } = await supabase
        .from("users")
        .select("id")
        .eq("role", "job_seeker")
        .limit(1);

      // Get an employer ID
      const { data: employers } = await supabase
        .from("users")
        .select("id")
        .eq("role", "employer")
        .limit(1);

      if (
        !jobSeekers ||
        jobSeekers.length === 0 ||
        !employers ||
        employers.length === 0
      ) {
        throw new Error("Could not find users for notifications");
      }

      const jobSeekerId = jobSeekers[0].id;
      const employerId = employers[0].id;

      // Create mock notifications
      const mockNotifications = [
        {
          user_id: jobSeekerId,
          title: "New Job Match",
          message:
            "A new Frontend Developer job matching your skills has been posted",
          type: "job",
          read: false,
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          link: "/dashboard/map-jobs",
        },
        {
          user_id: jobSeekerId,
          title: "Application Update",
          message: "Your application for Construction Worker has been reviewed",
          type: "application",
          read: false,
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
          link: "/dashboard/my-applications",
        },
        {
          user_id: jobSeekerId,
          title: "New Message",
          message: "You have a new message from BuildRight Construction",
          type: "message",
          read: false,
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          link: "/dashboard/messages",
        },
        {
          user_id: employerId,
          title: "New Applicant",
          message: "You have a new applicant for Frontend Developer position",
          type: "application",
          read: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          link: "/dashboard/applicants",
        },
        {
          user_id: employerId,
          title: "New Message",
          message: "You have a new message from a job applicant",
          type: "message",
          read: false,
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          link: "/dashboard/messages",
        },
      ];

      // Insert notifications
      const { error: notificationsError } = await supabase
        .from("notifications")
        .insert(mockNotifications);

      if (notificationsError) throw notificationsError;

      return true;
    } catch (error) {
      console.error("Error generating mock notifications:", error);
      throw error;
    }
  };

  return (
    <Button
      onClick={generateMockJobs}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700"
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Generating...
        </>
      ) : (
        "Generate Mock IT Jobs"
      )}
    </Button>
  );
}
