import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { useNavigate } from "react-router-dom";
import { MapPin, Briefcase, DollarSign, Clock, Calendar } from "lucide-react";

const jobTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Gig",
  "Internship",
];

const jobCategories = [
  "Construction",
  "Delivery",
  "Cleaning",
  "Retail",
  "Hospitality",
  "Farming",
  "Security",
  "Driving",
  "Other",
];

export default function PostJobForm() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState(userProfile?.businessName || "");
  const [location, setLocation] = useState(userProfile?.location || "");
  const [type, setType] = useState("Full-time");
  const [category, setCategory] = useState("");
  const [salary, setSalary] = useState("");
  const [skills, setSkills] = useState("");
  const [deadline, setDeadline] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to post a job",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!title || !description || !company || !location || !type || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate deadline is required and in the future
    if (!deadline) {
      toast({
        title: "Deadline Required",
        description: "Please set an application deadline for your job posting",
        variant: "destructive",
      });
      return;
    }

    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadlineDate < today) {
      toast({
        title: "Invalid Deadline",
        description: "The deadline must be in the future",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Process skills - trim and filter out empty entries
      const processedSkills = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      // Prepare the job data
      const jobData = {
        title,
        description,
        company,
        location,
        type,
        category,
        salary,
        skills: processedSkills,
        deadline,
        urgent,
        employer_id: user.id,
        status: "active",
        created_at: new Date().toISOString(),
        // Add salary min/max for better filtering
        salary_min: extractSalaryMin(salary),
        salary_max: extractSalaryMax(salary),
        payment_frequency: extractPaymentFrequency(salary),
        // Add coordinates for map view if available
        // This would typically come from a geocoding service
        // For now, we'll use placeholder values
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
      };

      // Insert the job into the database
      const { data, error } = await supabase
        .from("jobs")
        .insert([jobData])
        .select();

      if (error) throw error;

      // Send notifications to matching users
      try {
        // Import the notification function
        const { notifyMatchingUsers } = await import(
          "../job/JobPostingTrigger"
        );
        const notificationResult = await notifyMatchingUsers(data[0].id);
        console.log("Notification result:", notificationResult);
      } catch (notificationError) {
        console.error("Error sending notifications:", notificationError);
      }

      toast({
        title: "Success",
        description:
          "Job posted successfully! You can now manage it from your dashboard.",
        variant: "success",
      });

      // Clear form fields
      setTitle("");
      setDescription("");
      setSalary("");
      setSkills("");
      setDeadline("");
      setUrgent(false);

      // Navigate to manage jobs page after a short delay to allow the user to see the success message
      setTimeout(() => {
        navigate("/dashboard/manage-jobs");
      }, 1500);
    } catch (error: any) {
      console.error("Error posting job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to extract salary information
  const extractSalaryMin = (salaryText: string): number | null => {
    const numbers = salaryText.match(/\d+/g)?.map(Number) || [];
    return numbers.length > 0 ? Math.min(...numbers) : null;
  };

  const extractSalaryMax = (salaryText: string): number | null => {
    const numbers = salaryText.match(/\d+/g)?.map(Number) || [];
    return numbers.length > 1 ? Math.max(...numbers) : null;
  };

  const extractPaymentFrequency = (salaryText: string): string => {
    if (salaryText.toLowerCase().includes("/day")) return "Daily";
    if (salaryText.toLowerCase().includes("/week")) return "Weekly";
    if (salaryText.toLowerCase().includes("/month")) return "Monthly";
    if (salaryText.toLowerCase().includes("/year")) return "Yearly";
    return "Monthly"; // Default
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Post a New Job</h1>
        <p className="text-gray-600">
          Fill in the details below to create a new job listing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-base">
              Job Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. Construction Worker Needed"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-12 mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-base">
              Job Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the job responsibilities, requirements, and any other relevant details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-[150px] mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company" className="text-base flex items-center">
                <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
                Company/Business Name
              </Label>
              <Input
                id="company"
                placeholder="Your company or business name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                className="h-12 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-base flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g. Westlands, Nairobi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="h-12 mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="text-base">
                Job Type
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-12 mt-1">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((jobType) => (
                    <SelectItem key={jobType} value={jobType}>
                      {jobType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category" className="text-base">
                Job Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12 mt-1">
                  <SelectValue placeholder="Select job category" />
                </SelectTrigger>
                <SelectContent>
                  {jobCategories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary" className="text-base flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                Salary/Pay Rate
              </Label>
              <Input
                id="salary"
                placeholder="e.g. KSh 800-1200/day or KSh 15,000/month"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="h-12 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="deadline" className="text-base flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                Application Deadline <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="h-12 mt-1"
                min={new Date().toISOString().split("T")[0]} // Set minimum date to today
              />
              <p className="text-xs text-gray-500 mt-1">
                Jobs will be automatically removed after the deadline passes
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="skills" className="text-base">
              Required Skills (comma separated)
            </Label>
            <Input
              id="skills"
              placeholder="e.g. Construction, Painting, Carpentry"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="h-12 mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="urgent" checked={urgent} onCheckedChange={setUrgent} />
            <Label htmlFor="urgent" className="cursor-pointer">
              Mark as Urgent
            </Label>
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full h-12 bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Posting Job..." : "Post Job"}
          </Button>
        </div>
      </form>
    </div>
  );
}
