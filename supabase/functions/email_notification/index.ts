// This function sends email notifications to users when a job matching their skills is posted

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Use hardcoded fallback values if environment variables are not available
const supabaseUrl =
  Deno.env.get("SUPABASE_URL") ||
  Deno.env.get("VITE_SUPABASE_URL") ||
  "https://placeholder-project.supabase.co";

const supabaseServiceKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_KEY") ||
  Deno.env.get("SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_ANON_KEY") ||
  Deno.env.get("VITE_SUPABASE_ANON_KEY") ||
  "placeholder-key";

console.log("Creating Supabase client with URL and key");

// Create Supabase client with the available credentials
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  skills: string[];
  salary_min: number;
  salary_max: number | null;
  deadline: string;
  created_at: string;
  description?: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  skills: string[];
  location: string;
  preferred_categories: string[];
}

async function sendEmail(to: string, subject: string, body: string) {
  // In a real implementation, you would use an email service like SendGrid, Mailgun, etc.
  // For this example, we'll just log the email details
  console.log(
    `Sending email to ${to}:\nSubject: ${subject}\nBody: ${body.substring(0, 100)}...`,
  );

  // Example implementation with a hypothetical email service:
  // const response = await fetch('https://api.emailservice.com/send', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
  //   body: JSON.stringify({ to, subject, body }),
  // });
  // return response.ok;

  return true; // Simulating successful email sending
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the job data from the request
    const { job } = await req.json();

    if (!job || !job.id) {
      throw new Error("Job data is required");
    }

    // Get the job details
    let jobData;
    try {
      const { data, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", job.id)
        .single();

      jobData = data;

      if (jobError) {
        console.error("Database error when fetching job:", jobError);
        throw new Error(`Failed to fetch job: ${jobError.message}`);
      }

      if (!jobData) {
        console.error("Job not found with ID:", job.id);
        throw new Error("Job not found");
      }

      console.log("Successfully fetched job data:", {
        jobId: jobData.id,
        title: jobData.title,
      });
    } catch (error) {
      console.error("Exception when fetching job:", error);
      throw new Error(`Failed to fetch job: ${error.message}`);
    }

    const jobSkills = jobData.skills || [];
    const jobCategory = jobData.category || "";
    const jobLocation = jobData.location || "";

    // Find users with matching skills, categories, or location
    let users = [];
    try {
      const { data, error: usersError } = await supabase
        .from("users")
        .select("id, email, full_name, skills, location, preferred_categories")
        .not("email", "is", null);

      if (usersError) {
        console.error("Database error when fetching users:", usersError);
        throw new Error(`Failed to fetch users: ${usersError.message}`);
      }

      users = data || [];
      console.log(`Successfully fetched ${users.length} users`);
    } catch (error) {
      console.error("Exception when fetching users:", error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    // Filter users who have at least one matching skill, category, or location
    const matchingUsers = users.filter((user: User) => {
      const userSkills = user.skills || [];
      const userCategories = user.preferred_categories || [];
      const userLocation = user.location || "";

      // Check for skill match
      const hasSkillMatch = userSkills.some((skill) =>
        jobSkills.includes(skill),
      );

      // Check for category match
      const hasCategoryMatch = userCategories.includes(jobCategory);

      // Check for location match (simple substring match)
      const hasLocationMatch =
        jobLocation.toLowerCase().includes(userLocation.toLowerCase()) ||
        userLocation.toLowerCase().includes(jobLocation.toLowerCase());

      return hasSkillMatch || hasCategoryMatch || hasLocationMatch;
    });

    // Format salary
    const formatSalary = (min: number, max: number | null) => {
      const formatter = new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
      });

      if (max && max > min) {
        return `${formatter.format(min)} - ${formatter.format(max)}`;
      }
      return formatter.format(min);
    };

    // Format date
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-KE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Send email notifications to matching users
    const emailPromises = matchingUsers.map(async (user: User) => {
      const subject = `New Job Alert: ${jobData.title} at ${jobData.company}`;

      // Create a more visually appealing HTML email
      const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0; }
          .content { border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 5px 5px; }
          .job-title { font-size: 22px; font-weight: bold; margin-bottom: 5px; }
          .company { font-size: 18px; margin-bottom: 15px; }
          .details { margin-bottom: 20px; }
          .detail-row { margin-bottom: 10px; }
          .label { font-weight: bold; display: inline-block; width: 120px; }
          .skills { margin-top: 15px; }
          .skill-tag { background-color: #f1f1f1; padding: 5px 10px; border-radius: 3px; display: inline-block; margin-right: 5px; margin-bottom: 5px; }
          .cta-button { display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { margin-top: 30px; font-size: 12px; color: #777; }
          .description { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JobSoko - New Job Alert</h1>
          </div>
          <div class="content">
            <p>Hello ${user.full_name || "there"},</p>
            <p>We found a new job that matches your profile:</p>
            
            <div class="job-title">${jobData.title}</div>
            <div class="company">${jobData.company}</div>
            
            <div class="details">
              <div class="detail-row"><span class="label">Location:</span> ${jobData.location}</div>
              <div class="detail-row"><span class="label">Job Type:</span> ${jobData.type}</div>
              <div class="detail-row"><span class="label">Category:</span> ${jobData.category}</div>
              <div class="detail-row"><span class="label">Salary:</span> ${jobData.salary_min ? formatSalary(jobData.salary_min, jobData.salary_max) : "Negotiable"}</div>
              <div class="detail-row"><span class="label">Deadline:</span> ${formatDate(jobData.deadline)}</div>
            </div>
            
            <div class="description">
              <p><strong>Job Description:</strong></p>
              <p>${jobData.description || "No description provided."}</p>
            </div>
            
            <div class="skills">
              <p><strong>Required Skills:</strong></p>
              ${(jobData.skills || []).map((skill: string) => `<span class="skill-tag">${skill}</span>`).join(" ")}
            </div>
            
            <a href="${supabaseUrl}/dashboard/map-jobs?job=${jobData.id}" class="cta-button">View Job Details</a>
            <a href="${supabaseUrl}/dashboard/my-applications?apply=${jobData.id}" class="cta-button" style="background-color: #2196F3; margin-left: 10px;">Apply Now</a>
            
            <div class="footer">
              <p>You're receiving this email because you've signed up for job alerts on JobSoko.</p>
              <p>© ${new Date().getFullYear()} JobSoko. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
      `;

      // Plain text version as fallback
      const textBody = `
Hello ${user.full_name || "there"},

We found a new job that matches your profile:

Title: ${jobData.title}
Company: ${jobData.company}
Location: ${jobData.location}
Type: ${jobData.type}
Category: ${jobData.category}
Salary: ${jobData.salary_min ? formatSalary(jobData.salary_min, jobData.salary_max) : "Negotiable"}
Deadline: ${formatDate(jobData.deadline)}

Required Skills: ${(jobData.skills || []).join(", ")}

View Job Details: ${supabaseUrl}/dashboard/map-jobs?job=${jobData.id}

Best regards,
JobSoko Team
`;

      return sendEmail(user.email, subject, htmlBody || textBody);
    });

    await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({
        success: true,
        notified: matchingUsers.length,
        message: `Notifications sent to ${matchingUsers.length} matching users`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
