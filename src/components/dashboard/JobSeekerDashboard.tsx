import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Bell,
  Briefcase,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  XCircle,
  FileText,
  Settings,
  Search,
  Star,
  BookmarkIcon,
  Filter,
  Upload,
  Download,
  Calendar,
  DollarSign,
  GraduationCap,
  Moon,
  Sun,
  User,
  Phone,
  Mail,
  Building,
} from "lucide-react";
import JobCard from "../job/JobCard";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  salary_min: number;
  salary_max: number | null;
  created_at: string;
  deadline: string;
  skills: string[];
  urgent: boolean;
  status: string;
  payment_frequency: string;
  description?: string;
}

interface Application {
  id: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    urgent: boolean;
  };
  status: "pending" | "accepted" | "rejected" | "interview";
  created_at: string;
  interview_date?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

function ApplicationItem({
  application,
  navigate,
}: {
  application: Application;
  navigate: any;
}) {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium dark:text-white">
            {application.job.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {application.job.company}
          </p>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{application.job.location}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {getStatusBadge(application.status)}
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Applied on {new Date(application.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {application.status === "interview" && application.interview_date && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
            <span className="font-medium dark:text-blue-300">
              Interview scheduled for{" "}
              {new Date(application.interview_date).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() =>
            navigate(`/dashboard/messages?employer=${application.job.id}`)
          }
        >
          <MessageSquare className="h-3 w-3 mr-1" /> Message Employer
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() =>
            navigate(`/dashboard/my-applications?id=${application.id}`)
          }
        >
          <FileText className="h-3 w-3 mr-1" /> View Details
        </Button>
      </div>
    </div>
  );
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
        >
          Pending
        </Badge>
      );
    case "accepted":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
        >
          Accepted
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
        >
          Rejected
        </Badge>
      );
    case "interview":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
        >
          Interview
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function JobSeekerDashboard() {
  const { user, userProfile, toggleDarkMode } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchApplications();
      fetchNotifications();
      fetchJobs();
      fetchSavedJobs();
    }
  }, [user]);

  // Filter jobs when search value changes
  useEffect(() => {
    if (searchValue.trim() === "") {
      setFilteredJobs(recentJobs);
    } else {
      const lowercaseSearch = searchValue.toLowerCase();
      const filtered = recentJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(lowercaseSearch) ||
          job.company.toLowerCase().includes(lowercaseSearch) ||
          job.location.toLowerCase().includes(lowercaseSearch) ||
          job.category.toLowerCase().includes(lowercaseSearch) ||
          (job.skills &&
            job.skills.some((skill) =>
              skill.toLowerCase().includes(lowercaseSearch),
            )),
      );
      setFilteredJobs(filtered);
    }
  }, [searchValue, recentJobs]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          id,
          status,
          created_at,
          interview_date,
          job:job_id(id, title, company, location, salary, type, urgent)
        `,
        )
        .eq("applicant_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      // Get current date for deadline comparison
      const currentDate = new Date().toISOString().split("T")[0];

      // Fetch all active jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .gte("deadline", currentDate)
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      // Set recent jobs
      setRecentJobs(jobsData || []);
      setFilteredJobs(jobsData || []);

      // Get user skills for recommendations
      const userSkills = userProfile?.skills || [];

      // Filter jobs based on user skills for recommendations
      if (userSkills.length > 0 && jobsData) {
        const recommended = jobsData.filter((job) => {
          const jobSkills = job.skills || [];
          return jobSkills.some((skill) => userSkills.includes(skill));
        });
        setRecommendedJobs(
          recommended.length > 0 ? recommended : jobsData.slice(0, 5),
        );
      } else {
        // If no skills match, just show recent jobs as recommendations
        setRecommendedJobs(jobsData?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
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

  const markNotificationAsRead = async (id: string) => {
    try {
      await supabase.from("notifications").update({ read: true }).eq("id", id);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
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

  const formatSalary = (
    min: number,
    max: number | null,
    frequency: string = "month",
  ) => {
    const formatter = new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    });

    if (max && max > min) {
      return `${formatter.format(min)} - ${formatter.format(max)}/${frequency}`;
    }
    return `${formatter.format(min)}/${frequency}`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  {
    /* Temporarily disabled role check to allow access to job seeker dashboard */
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {userProfile?.fullName || "Job Seeker"}
          </h1>
          <p className="text-gray-500">
            Find and apply to the best jobs in your area
          </p>
        </div>

        <Button
          onClick={() => navigate("/dashboard/map-jobs")}
          className="bg-green-600 hover:bg-green-700"
        >
          <MapPin className="mr-2 h-4 w-4" /> Find Jobs Near Me
        </Button>
      </div>

      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.length > 0 ? (
              applications.slice(0, 2).map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">
                        {application.job.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {application.job.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {getStatusBadge(application.status)}
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getTimeAgo(application.created_at)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">
                  No recent activity
                </p>
              </div>
            )}

            {notifications.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium dark:text-white">
                      {notifications[0].title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {notifications[0].message}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {getTimeAgo(notifications[0].created_at)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard/my-applications")}
              >
                <Briefcase className="h-4 w-4 mr-1" /> My Applications
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard/notifications")}
              >
                <Bell className="h-4 w-4 mr-1" /> Notifications
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Summary */}
        <Card className="md:w-1/3 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium dark:text-white">
              My Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                {userProfile?.profilePhotoUrl ? (
                  <AvatarImage
                    src={userProfile.profilePhotoUrl}
                    alt={userProfile.fullName}
                  />
                ) : (
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                  />
                )}
                <AvatarFallback className="dark:bg-gray-700 dark:text-gray-200">
                  {userProfile?.fullName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-lg dark:text-white">
                  {userProfile?.fullName}
                </h3>
                <p className="text-gray-500 text-sm dark:text-gray-300">
                  {user?.email}
                </p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm dark:text-gray-300">
                    {userProfile?.rating || "No ratings"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  Skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {userProfile?.skills?.length ? (
                    userProfile.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No skills specified
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-3 dark:bg-gray-700" />

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Location
                  </p>
                  <p className="text-sm dark:text-gray-300">
                    {userProfile?.location || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/dashboard/profile")}
              >
                <Settings className="h-4 w-4 mr-1" /> Edit Profile
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                onClick={() => navigate("/dashboard/resume")}
              >
                <FileText className="h-4 w-4 mr-1" /> View Resume
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Application Stats */}
        <Card className="md:w-2/3 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium dark:text-white">
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                      Pending
                    </p>
                    <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  </div>
                  <p className="text-2xl font-semibold mt-2 dark:text-white">
                    {
                      applications.filter((app) => app.status === "pending")
                        .length
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Accepted
                    </p>
                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                  </div>
                  <p className="text-2xl font-semibold mt-2 dark:text-white">
                    {
                      applications.filter((app) => app.status === "accepted")
                        .length
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      Rejected
                    </p>
                    <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                  </div>
                  <p className="text-2xl font-semibold mt-2 dark:text-white">
                    {
                      applications.filter((app) => app.status === "rejected")
                        .length
                    }
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="applications">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="applications">
                  Recent Applications
                </TabsTrigger>
                <TabsTrigger value="recommended">Recommended Jobs</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="applications" className="space-y-4">
                {applications.length > 0 ? (
                  applications
                    .slice(0, 3)
                    .map((application) => (
                      <ApplicationItem
                        key={application.id}
                        application={application}
                        navigate={navigate}
                      />
                    ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400">
                      You haven't applied to any jobs yet.
                    </p>
                    <Button
                      className="mt-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                      onClick={() => navigate("/dashboard/jobs")}
                    >
                      Browse Jobs
                    </Button>
                  </div>
                )}

                {applications.length > 3 && (
                  <div className="text-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/dashboard/my-applications")}
                    >
                      View All Applications
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recommended" className="space-y-4">
                {recommendedJobs.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {recommendedJobs.slice(0, 3).map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSaved={savedJobs.includes(job.id)}
                        onSave={() => toggleSaveJob(job.id)}
                        onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
                        formatSalary={formatSalary}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400">
                      No recommended jobs found. Update your skills to get
                      personalized recommendations.
                    </p>
                    <Button
                      className="mt-2"
                      onClick={() => navigate("/dashboard/profile")}
                    >
                      Update Skills
                    </Button>
                  </div>
                )}

                <div className="text-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard/jobs")}
                  >
                    Browse All Jobs
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${notification.read ? "bg-gray-50 dark:bg-gray-800" : "bg-blue-50 dark:bg-blue-900/20"} ${notification.read ? "border-gray-200 dark:border-gray-700" : "border-blue-200 dark:border-blue-800"}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4
                            className={`font-medium ${notification.read ? "text-gray-700 dark:text-gray-300" : "text-blue-700 dark:text-blue-300"}`}
                          >
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getTimeAgo(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400">
                      No notifications yet.
                    </p>
                  </div>
                )}

                {notifications.length > 0 && (
                  <div className="text-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/dashboard/notifications")}
                    >
                      View All Notifications
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-white">Recent Jobs</h2>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search jobs..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 pr-4 py-2"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/map-jobs")}
              className="text-sm"
            >
              View All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.length > 0 ? (
            filteredJobs
              .slice(0, 6)
              .map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobs.includes(job.id)}
                  onSave={() => toggleSaveJob(job.id)}
                  onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
                  formatSalary={formatSalary}
                  formatDate={formatDate}
                />
              ))
          ) : (
            <div className="col-span-3 text-center py-8">
              {searchValue ? (
                <p className="text-gray-500 dark:text-gray-400">
                  No jobs matching "{searchValue}" found. Try a different search
                  term.
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No jobs available at the moment.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
