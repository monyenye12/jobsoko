// This function sends email notifications to users when a job matching their skills is posted

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  skills: string[];
  category: string;
  type: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  skills: string[];
}

async function sendEmail(to: string, subject: string, body: string) {
  // In a real implementation, you would use an email service like SendGrid, Mailgun, etc.
  // For this example, we'll just log the email details
  console.log(`Sending email to ${to}:\nSubject: ${subject}\nBody: ${body}`);

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
    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", job.id)
      .single();

    if (jobError || !jobData) {
      throw new Error(
        `Failed to fetch job: ${jobError?.message || "Job not found"}`,
      );
    }

    const jobSkills = jobData.skills || [];

    // Find users with matching skills
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, full_name, skills")
      .not("email", "is", null);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    // Filter users who have at least one matching skill
    const matchingUsers = users.filter((user: User) => {
      const userSkills = user.skills || [];
      return userSkills.some((skill) => jobSkills.includes(skill));
    });

    // Send email notifications to matching users
    const emailPromises = matchingUsers.map(async (user: User) => {
      const subject = `New Job Alert: ${jobData.title} at ${jobData.company}`;
      const body = `
Hello ${user.full_name || "there"},

A new job matching your skills has been posted:

Title: ${jobData.title}
Company: ${jobData.company}
Location: ${jobData.location}
Type: ${jobData.type}

Apply now at: ${supabaseUrl}/dashboard/map-jobs?job=${jobData.id}

Best regards,
JobSoko Team
`;

      return sendEmail(user.email, subject, body);
    });

    await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({ success: true, notified: matchingUsers.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
