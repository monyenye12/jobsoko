import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  MapPin,
  Briefcase,
  Clock,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  Star,
  Building,
  DollarSign,
  Users,
  Phone,
  Mail,
  Send,
  CheckCircle,
  XCircle,
  User,
  X,
  AlertCircle,
  Upload,
  FileText,
  Zap,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import JobCard from "./JobCard";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  description: string;
  salary_min: number;
  salary_max: number | null;
  salary_type: string;
  payment_frequency: string;
  payment_method: string;
  benefits: string[];
  skills: string[];
  positions: number;
  work_hours: string;
  is_remote: boolean;
  deadline: string;
  application_methods: string[];
  contact_person: string;
  contact_phone: string;
  created_at: string;
  employer_id: string;
  status: string;
  urgent: boolean;
  latitude?: number;
  longitude?: number;
}

interface Employer {
  id: string;
  full_name: string;
  business_name: string;
  business_type: string;
  profile_photo_url: string;
  verified: boolean;
}

interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  status: string;
  cover_letter: string;
  created_at: string;
}

export default function MapJobView() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [application, setApplication] = useState<Application | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    jobType: [] as string[],
    category: [] as string[],
    urgent: false,
    salaryRange: [0, 100000] as [number, number],
  });

  const jobCategories = [
    "Construction",
    "IT",
    "Healthcare",
    "Retail",
    "Hospitality",
    "Transportation",
    "Education",
    "Manufacturing",
    "Agriculture",
    "Security",
    "Cleaning",
    "Driving",
    "Farming",
  ];

  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Freelance/Gig",
    "Remote",
  ];

  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.search);
    const jobId = params.get("job");
    const category = params.get("category");

    // Always create fallback mock jobs to ensure data is available
    createFallbackMockJobs();

    // Fetch jobs immediately on component mount
    fetchJobs();
    if (user) {
      fetchSavedJobs();
    }

    if (jobId) {
      fetchJobDetails(jobId);
    }

    // Set category filter if provided in URL - ensure case-insensitive handling
    if (category) {
      setCategoryFilter(category.toLowerCase());
    }
  }, [location.search, user]);

  useEffect(() => {
    filterJobs();
  }, [
    searchQuery,
    categoryFilter,
    typeFilter,
    locationFilter,
    jobs,
    activeTab,
    filters,
  ]);

  // Function to check if we have jobs and load mock data if needed
  const checkAndLoadMockData = async () => {
    try {
      const { count, error } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true });

      if (error) throw error;

      // If no jobs found, use the fallback mock data directly
      if (count === 0) {
        console.log("No jobs found, using fallback mock data...");
        toast({
          title: "Demo Mode",
          description: "Using mock job data for demonstration",
        });

        // Create fallback mock jobs directly
        createFallbackMockJobs();
      }
    } catch (error) {
      console.error("Error checking for jobs:", error);
      // If there's an error, still create the mock jobs
      createFallbackMockJobs();
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // If no data is returned, it might be because the database is empty
      if (!data || data.length === 0) {
        console.log("No jobs found in database. Using fallback mock data...");

        // Skip the database operation and use fallback mock data directly
        createFallbackMockJobs();
      } else {
        setJobs(data);
        setFilteredJobs(data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
      // Create fallback mock jobs if everything else fails
      createFallbackMockJobs();
    } finally {
      setLoading(false);
    }
  };

  // Create fallback mock jobs directly in the component if database operations fail
  const createFallbackMockJobs = () => {
    const mockJobs: Job[] = [
      {
        id: "mock-1",
        title: "Frontend Developer",
        company: "TechSolutions Ltd",
        location: "Nairobi, Kenya",
        type: "Full-time",
        category: "IT",
        description:
          "We are looking for a skilled Frontend Developer to join our team.",
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
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        application_methods: [
          "Apply Directly via JobSoko",
          "Submit CV & Cover Letter",
        ],
        contact_person: "John Doe",
        contact_phone: "+254712345678",
        created_at: new Date().toISOString(),
        employer_id: "mock-employer",
        status: "active",
        urgent: false,
        latitude: -1.2921,
        longitude: 36.8219,
      },
      {
        id: "mock-2",
        title: "Backend Developer",
        company: "DataTech Systems",
        location: "Mombasa, Kenya",
        type: "Full-time",
        category: "IT",
        description:
          "Looking for a Backend Developer with experience in Node.js and Express.",
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
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        application_methods: [
          "Apply Directly via JobSoko",
          "Submit CV & Cover Letter",
        ],
        contact_person: "Jane Smith",
        contact_phone: "+254723456789",
        created_at: new Date().toISOString(),
        employer_id: "mock-employer",
        status: "active",
        urgent: false,
        latitude: -4.0435,
        longitude: 39.6682,
      },
      {
        id: "mock-3",
        title: "Mobile App Developer",
        company: "AppWorks Kenya",
        location: "Kisumu, Kenya",
        type: "Contract",
        category: "IT",
        description:
          "Seeking a Mobile App Developer with experience in React Native or Flutter.",
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
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        application_methods: [
          "Apply Directly via JobSoko",
          "Submit CV & Cover Letter",
        ],
        contact_person: "Michael Ochieng",
        contact_phone: "+254734567890",
        created_at: new Date().toISOString(),
        employer_id: "mock-employer",
        status: "active",
        urgent: true,
        latitude: -0.1022,
        longitude: 34.7617,
      },
    ];

    setJobs(mockJobs);
    setFilteredJobs(mockJobs);

    toast({
      title: "Demo Mode",
      description: "Using mock job data for demonstration",
    });
  };

  const fetchJobDetails = async (jobId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (error) throw error;

      setSelectedJob(data);

      // Fetch employer details
      if (data.employer_id) {
        fetchEmployerDetails(data.employer_id);
      }

      // Check if user has applied
      if (user) {
        checkApplication(jobId);
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployerDetails = async (employerId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", employerId)
        .single();

      if (error) throw error;

      setEmployer(data);
    } catch (error) {
      console.error("Error fetching employer details:", error);
    }
  };

  const fetchSavedJobs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", user.id);

      if (error) throw error;

      setSavedJobs(data?.map((item) => item.job_id) || []);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  const checkApplication = async (jobId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("job_id", jobId)
        .eq("applicant_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is the error code for "No rows found"
        throw error;
      }

      setApplication(data || null);
    } catch (error) {
      console.error("Error checking application:", error);
    }
  };

  const toggleSaveJob = async (jobId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      if (savedJobs.includes(jobId)) {
        // Remove from saved jobs
        const { error } = await supabase
          .from("saved_jobs")
          .delete()
          .eq("user_id", user.id)
          .eq("job_id", jobId);

        if (error) throw error;

        setSavedJobs(savedJobs.filter((id) => id !== jobId));
        toast({
          title: "Job removed",
          description: "Job removed from saved jobs",
        });
      } else {
        // Add to saved jobs
        const { error } = await supabase.from("saved_jobs").insert([
          {
            user_id: user.id,
            job_id: jobId,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        setSavedJobs([...savedJobs, jobId]);
        toast({
          title: "Job saved",
          description: "Job added to saved jobs",
        });
      }
    } catch (error) {
      console.error("Error toggling saved job:", error);
      toast({
        title: "Error",
        description: "Failed to save/unsave job",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];

    if (!file) return;

    // Check file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    // Log file type for debugging
    console.log("File type:", file.type);

    // More permissive check for file types
    const isPdf = file.type.includes("pdf");
    const isDocx =
      file.type.includes("document") || file.name.endsWith(".docx");

    if (!isPdf && !isDocx) {
      setFileError("Please upload a PDF or DOCX file");
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size must be less than 5MB");
      return;
    }

    setCvFile(file);
  };

  const uploadCV = async (): Promise<string | null> => {
    if (!cvFile || !user) return null;

    try {
      try {
        // First check if the bucket exists
        const { data: buckets, error: listError } =
          await supabase.storage.listBuckets();

        if (listError) {
          console.error("Error listing buckets:", listError);
          // Continue anyway, we'll try to create the bucket
        }

        const bucketExists = buckets?.some((bucket) => bucket.name === "cvs");

        // Create the bucket if it doesn't exist
        if (!bucketExists) {
          console.log("Creating 'cvs' bucket...");
          try {
            const { error: bucketError } = await supabase.storage.createBucket(
              "cvs",
              {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: [
                  "application/pdf",
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ],
              },
            );

            if (bucketError) {
              console.error("Error creating bucket:", bucketError);
              // Continue anyway, as the bucket might exist despite the error
            }
          } catch (bucketCreateError) {
            console.error("Exception creating bucket:", bucketCreateError);
            // Continue anyway, the bucket might already exist
          }
        }
      } catch (storageError) {
        console.error("Storage operation error:", storageError);
        // Continue with upload attempt anyway
      }

      // Generate a unique filename
      const fileExt = cvFile.name.split(".").pop() || "pdf";
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log(`Uploading file ${fileName} to 'cvs' bucket...`);

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(filePath, cvFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage.from("cvs").getPublicUrl(filePath);
      console.log("File uploaded successfully, URL:", data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading CV:", error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload CV: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedJob) return;

    setSubmitting(true);

    try {
      // Upload CV if provided
      let cvUrl = null;
      if (cvFile) {
        try {
          cvUrl = await uploadCV();
          console.log("CV uploaded successfully:", cvUrl);
        } catch (uploadError) {
          console.error("CV upload failed:", uploadError);
          // Continue with application even if CV upload fails
          toast({
            title: "CV Upload Issue",
            description:
              "Your application will be submitted without a CV. You can add it later from your profile.",
            variant: "warning",
          });
        }
      }

      console.log("Creating application record...");
      // Create application record
      const { data, error } = await supabase
        .from("applications")
        .insert([
          {
            job_id: selectedJob.id,
            applicant_id: user.id,
            employer_id: selectedJob.employer_id,
            status: "pending",
            cover_letter: coverLetter,
            cv_url: cvUrl,
            created_at: new Date().toISOString(),
            resume_url: cvUrl, // Add to resume_url field as well for compatibility
          },
        ])
        .select();

      if (error) {
        console.error("Error creating application:", error);
        throw error;
      }

      console.log("Application created successfully:", data);

      // Create notification for employer
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            user_id: selectedJob.employer_id,
            title: "New Job Application",
            message: `${userProfile?.fullName || userProfile?.full_name || "A job seeker"} has applied for your ${selectedJob.title} position`,
            type: "application",
            read: false,
            created_at: new Date().toISOString(),
            link: "/dashboard/applicants",
          },
        ]);

      if (notificationError) {
        console.warn(
          "Failed to create notification, but application was successful:",
          notificationError,
        );
      }

      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully",
      });

      setShowSuccess(true);
      setShowApplicationForm(false);
      setCoverLetter("");
      setCvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setApplication({
        id: data[0].id,
        job_id: selectedJob.id,
        applicant_id: user.id,
        status: "pending",
        cover_letter: coverLetter,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error applying for job:", error);
      toast({
        title: "Error",
        description:
          "Failed to submit application: " + (error as any)?.message ||
          "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Apply tab filter
    if (activeTab === "urgent") {
      filtered = filtered.filter((job) => job.urgent);
    } else if (activeTab === "recent") {
      // Sort by most recent first (already done by default)
      filtered = filtered.slice(0, 20); // Just show the 20 most recent
    } else if (activeTab === "highpay") {
      // Sort by highest salary
      filtered.sort((a, b) => {
        const aMax = a.salary_max || a.salary_min;
        const bMax = b.salary_max || b.salary_min;
        return bMax - aMax;
      });
      filtered = filtered.slice(0, 20); // Just show the 20 highest paying
    }

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query) ||
          (job.category && job.category.toLowerCase().includes(query)),
      );
    }

    // Apply category filter - case-insensitive
    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter(
        (job) =>
          job.category &&
          job.category.toLowerCase() === categoryFilter.toLowerCase(),
      );
    }

    // Apply type filter - case-insensitive
    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter(
        (job) =>
          job.type && job.type.toLowerCase() === typeFilter.toLowerCase(),
      );
    }

    // Apply location filter
    if (locationFilter) {
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase()),
      );
    }

    // Apply filters from filter panel
    if (filters.jobType.length > 0) {
      filtered = filtered.filter((job) =>
        filters.jobType.some(
          (type) => job.type && job.type.toLowerCase() === type.toLowerCase(),
        ),
      );
    }

    if (filters.category.length > 0) {
      filtered = filtered.filter((job) =>
        filters.category.some(
          (category) =>
            job.category &&
            job.category.toLowerCase() === category.toLowerCase(),
        ),
      );
    }

    if (filters.urgent) {
      filtered = filtered.filter((job) => job.urgent);
    }

    filtered = filtered.filter(
      (job) =>
        job.salary_min >= filters.salaryRange[0] &&
        (job.salary_max
          ? job.salary_max <= filters.salaryRange[1]
          : job.salary_min <= filters.salaryRange[1]),
    );

    setFilteredJobs(filtered);
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  };

  const clearSelectedJob = () => {
    setSelectedJob(null);
    setEmployer(null);
    setApplication(null);
    navigate("/dashboard/map-jobs");
  };

  const handleFilterChange = (
    type: string,
    value: string | boolean | number | [number, number],
  ) => {
    if (type === "jobType" || type === "category") {
      const currentValues = filters[type] as string[];
      const newValues = currentValues.includes(value as string)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value as string];

      setFilters({ ...filters, [type]: newValues });
    } else {
      setFilters({ ...filters, [type]: value });
    }
  };

  const clearFilters = () => {
    setFilters({
      jobType: [],
      category: [],
      urgent: false,
      salaryRange: [0, 100000],
    });
    setSearchQuery("");
    setCategoryFilter("all");
    setTypeFilter("all");
    setLocationFilter("");
    setActiveTab("all");
  };

  if (loading && !selectedJob && filteredJobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-blue-50 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-2xl font-bold flex items-center text-gray-800">
              <Briefcase className="mr-2 h-6 w-6 text-green-600" />
              Find Your Perfect Job
            </CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs, skills, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-full border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <Button
                variant="outline"
                className="whitespace-nowrap rounded-full border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Category Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-4 gap-2 bg-gray-50 p-1 rounded-full w-full max-w-2xl mx-auto">
              <TabsTrigger
                value="all"
                className="rounded-full data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                All Jobs
              </TabsTrigger>
              <TabsTrigger
                value="urgent"
                className="rounded-full data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                <Zap className="h-4 w-4 mr-1" />
                Urgent
              </TabsTrigger>
              <TabsTrigger
                value="recent"
                className="rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Clock className="h-4 w-4 mr-1" />
                Recent
              </TabsTrigger>
              <TabsTrigger
                value="highpay"
                className="rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                High Pay
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters */}
          {showFilters && (
            <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-800 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
                  Refine Your Search
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-xs hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-3 w-3 mr-1" /> Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Job Type */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-gray-700">
                    Job Type
                  </h4>
                  <div className="space-y-2">
                    {jobTypes.map((type) => (
                      <div key={type} className="flex items-center">
                        <Checkbox
                          id={`type-${type}`}
                          checked={filters.jobType.includes(type)}
                          onCheckedChange={() =>
                            handleFilterChange("jobType", type)
                          }
                          className="text-green-600 focus:ring-green-500"
                        />
                        <Label
                          htmlFor={`type-${type}`}
                          className="ml-2 text-sm text-gray-600"
                        >
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-gray-700">
                    Category
                  </h4>
                  <div className="space-y-2">
                    {jobCategories.map((category) => (
                      <div key={category} className="flex items-center">
                        <Checkbox
                          id={`category-${category}`}
                          checked={filters.category.includes(category)}
                          onCheckedChange={() =>
                            handleFilterChange("category", category)
                          }
                          className="text-green-600 focus:ring-green-500"
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="ml-2 text-sm text-gray-600"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other Filters */}
                <div className="space-y-4">
                  {/* Urgent Only */}
                  <div className="flex items-center">
                    <Checkbox
                      id="urgent-only"
                      checked={filters.urgent}
                      onCheckedChange={(checked) =>
                        handleFilterChange("urgent", !!checked)
                      }
                      className="text-red-600 focus:ring-red-500"
                    />
                    <Label
                      htmlFor="urgent-only"
                      className="ml-2 text-sm text-gray-600"
                    >
                      Urgent Jobs Only
                    </Label>
                  </div>

                  {/* Salary Range */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-gray-700">
                      Salary Range
                    </h4>
                    <div className="px-2">
                      <Slider
                        defaultValue={[0, 100000]}
                        max={100000}
                        step={5000}
                        value={filters.salaryRange}
                        onValueChange={(value) =>
                          handleFilterChange(
                            "salaryRange",
                            value as [number, number],
                          )
                        }
                        className="my-4"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          {new Intl.NumberFormat("en-KE", {
                            style: "currency",
                            currency: "KES",
                            maximumFractionDigits: 0,
                          }).format(filters.salaryRange[0])}
                        </span>
                        <span>
                          {new Intl.NumberFormat("en-KE", {
                            style: "currency",
                            currency: "KES",
                            maximumFractionDigits: 0,
                          }).format(filters.salaryRange[1])}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-gray-700">
                      Location
                    </h4>
                    <Input
                      placeholder="Filter by location"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="rounded-md border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {filteredJobs.length}
              </span>{" "}
              jobs
            </p>
            <Select defaultValue="newest">
              <SelectTrigger className="w-[180px] rounded-full border-gray-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="salary-high">Highest Salary</SelectItem>
                <SelectItem value="salary-low">Lowest Salary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Job Listings */}
          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    title={job.title}
                    company={job.company}
                    location={job.location}
                    distance={job.is_remote ? "Remote" : undefined}
                    salary={formatSalary(job.salary_min, job.salary_max)}
                    type={job.type}
                    posted={`Posted ${getTimeAgo(job.created_at)}`}
                    skills={job.skills}
                    urgent={job.urgent}
                    onClick={() => fetchJobDetails(job.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No Jobs Found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  We couldn't find any jobs matching your criteria. Try
                  adjusting your filters or search terms.
                </p>
                <Button
                  onClick={clearFilters}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <X className="h-4 w-4 mr-2" /> Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredJobs.length > 12 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-50 text-green-600 border-green-200"
                >
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
