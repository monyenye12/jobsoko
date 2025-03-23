import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Bell,
  Briefcase,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  PlusCircle,
  Users,
  XCircle,
  Settings,
  Shield,
  Star,
  DollarSign,
  FileText,
  BarChart2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  created_at: string;
  status: string;
  applications_count: number;
}

interface Applicant {
  id: string;
  application_id: string;
  job_id: string;
  job_title: string;
  full_name: string;
  email: string;
  status: "pending" | "accepted" | "rejected" | "interview";
  created_at: string;
  skills: string[];
  rating: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

// Job Item Component for displaying job listings
const JobItem = ({ job }: { job: Job }) => {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{job.title}</h3>
          <p className="text-sm text-gray-600">{job.company}</p>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{job.location}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {getJobStatusBadge(job.status)}
          <span className="text-xs text-gray-500 mt-1">
            Posted on {new Date(job.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center mt-3 text-sm text-gray-600">
        <Briefcase className="h-4 w-4 mr-1 text-gray-400" />
        <span>{job.type}</span>
        <span className="mx-2">•</span>
        <Users className="h-4 w-4 mr-1 text-gray-400" />
        <span>{job.applications_count} applicants</span>
      </div>

      <div className="flex justify-between mt-4">
        <Button variant="outline" size="sm" className="text-xs">
          <MessageSquare className="h-3 w-3 mr-1" /> View Applications
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          Edit Job
        </Button>
      </div>
    </div>
  );
};

// Applicant Item Component for displaying applicants
const ApplicantItem = ({
  applicant,
  onStatusChange,
}: {
  applicant: Applicant;
  onStatusChange: (applicationId: string, newStatus: string) => void;
}) => {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{applicant.full_name}</h3>
          <p className="text-sm text-gray-600">{applicant.email}</p>
          <p className="text-xs text-gray-500 mt-1">
            Applied for: {applicant.job_title}
          </p>
        </div>
        <div className="flex flex-col items-end">
          {getStatusBadge(applicant.status)}
          <span className="text-xs text-gray-500 mt-1">
            Applied on {new Date(applicant.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {applicant.skills && applicant.skills.length > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-1">
            {applicant.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center mt-3">
        <Star className="h-4 w-4 text-yellow-400 mr-1" />
        <span className="text-sm font-medium">
          {applicant.rating || "N/A"} Rating
        </span>
      </div>

      <div className="flex justify-between mt-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
            onClick={() => onStatusChange(applicant.application_id, "accepted")}
          >
            <CheckCircle className="h-3 w-3 mr-1" /> Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
            onClick={() =>
              onStatusChange(applicant.application_id, "interview")
            }
          >
            <Clock className="h-3 w-3 mr-1" /> Schedule Interview
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            onClick={() => onStatusChange(applicant.application_id, "rejected")}
          >
            <XCircle className="h-3 w-3 mr-1" /> Reject
          </Button>
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          <MessageSquare className="h-3 w-3 mr-1" /> Message
        </Button>
      </div>
    </div>
  );
};

export default function EmployerDashboard() {
  const { user, userProfile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchApplicants();
      fetchNotifications();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(
          `
          id,
          title,
          company,
          location,
          type,
          created_at,
          status
        `,
        )
        .eq("employer_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get application counts for each job
      const jobsWithCounts = await Promise.all(
        (data || []).map(async (job) => {
          const { count, error: countError } = await supabase
            .from("applications")
            .select("id", { count: "exact" })
            .eq("job_id", job.id);

          if (countError) throw countError;

          return {
            ...job,
            applications_count: count || 0,
          };
        }),
      );

      setJobs(jobsWithCounts);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchApplicants = async () => {
    try {
      // Get all jobs posted by this employer
      const { data: employerJobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("employer_id", user?.id);

      if (jobsError) throw jobsError;

      if (!employerJobs || employerJobs.length === 0) {
        setApplicants([]);
        setLoading(false);
        return;
      }

      const jobIds = employerJobs.map((job) => job.id);

      // Get all applications for these jobs
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          id,
          job_id,
          status,
          created_at,
          applicant:applicant_id(id, full_name, email, skills, rating)
        `,
        )
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Format the applicants data
      const formattedApplicants = data?.map((app) => {
        const job = employerJobs.find((j) => j.id === app.job_id);
        return {
          id: app.applicant.id,
          application_id: app.id,
          job_id: app.job_id,
          job_title: job?.title || "Unknown Job",
          full_name: app.applicant.full_name,
          email: app.applicant.email,
          status: app.status,
          created_at: app.created_at,
          skills: app.applicant.skills || [],
          rating: app.applicant.rating || 0,
        };
      });

      setApplicants(formattedApplicants || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      setLoading(false);
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

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string,
  ) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      // Update local state
      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant.application_id === applicationId
            ? { ...applicant, status: newStatus as any }
            : applicant,
        ),
      );
    } catch (error) {
      console.error("Error updating application status:", error);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Rejected
          </Badge>
        );
      case "interview":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Interview
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getJobStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Active
          </Badge>
        );
      case "closed":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Closed
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Draft
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Business Profile */}
        <Card className="md:w-1/3 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Business Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${userProfile?.businessName || user?.email}`}
                />
                <AvatarFallback>
                  {userProfile?.businessName?.[0] || userProfile?.fullName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-lg">
                  {userProfile?.businessName || "Your Business"}
                </h3>
                <p className="text-gray-500 text-sm">
                  {userProfile?.businessType || "Business Type"}
                </p>
                {userProfile?.verified ? (
                  <div className="flex items-center mt-1 text-xs text-green-600">
                    <Shield className="h-3 w-3 mr-1" />
                    <span>Verified Business</span>
                  </div>
                ) : (
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <Shield className="h-3 w-3 mr-1" />
                    <span>Verification pending</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-gray-600">
                    {userProfile?.location || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Contact Person</p>
                  <p className="text-sm text-gray-600">
                    {userProfile?.fullName || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Briefcase className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Active Job Listings</p>
                  <p className="text-sm text-gray-600">
                    {jobs.filter((job) => job.status === "active").length}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Star className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Employer Rating</p>
                  <p className="text-sm text-gray-600">
                    {userProfile?.rating || "No ratings yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1">
                <Settings className="h-4 w-4 mr-1" /> Edit Profile
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => navigate("/post-job")}
              >
                <PlusCircle className="h-4 w-4 mr-1" /> Post Job
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Stats */}
        <Card className="md:w-2/3 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Dashboard Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-green-50 border-green-100">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-green-700">
                      Active Jobs
                    </p>
                    <Briefcase className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {jobs.filter((job) => job.status === "active").length}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-blue-700">
                      Total Applicants
                    </p>
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {applicants.length}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-100">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-yellow-700">
                      Pending Review
                    </p>
                    <Clock className="h-4 w-4 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {
                      applicants.filter((app) => app.status === "pending")
                        .length
                    }
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-purple-50 border-purple-100">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-purple-700">
                      Interviews Scheduled
                    </p>
                    <Clock className="h-4 w-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {
                      applicants.filter((app) => app.status === "interview")
                        .length
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-indigo-50 border-indigo-100">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-indigo-700">
                      Hired Workers
                    </p>
                    <CheckCircle className="h-4 w-4 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {
                      applicants.filter((app) => app.status === "accepted")
                        .length
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-100">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-orange-700">
                      Unread Messages
                    </p>
                    <MessageSquare className="h-4 w-4 text-orange-500" />
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {notifications.filter((n) => !n.read).length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="jobs">
              <TabsList className="mb-4">
                <TabsTrigger value="jobs">My Job Listings</TabsTrigger>
                <TabsTrigger value="applicants">Applicants</TabsTrigger>
                <TabsTrigger value="tasks">Task Board</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="space-y-4">
                {jobs.length > 0 ? (
                  jobs.map((job) => <JobItem key={job.id} job={job} />)
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No Job Listings Yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Post your first job to start receiving applications
                    </p>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => navigate("/post-job")}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Post a Job
                    </Button>
                  </div>
                )}

                {jobs.length > 0 && (
                  <Button
                    className="w-full mt-2 bg-green-600 hover:bg-green-700"
                    onClick={() => navigate("/post-job")}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Post a New Job
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="applicants" className="space-y-4">
                {applicants.length > 0 ? (
                  <>
                    <div className="flex justify-between mb-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          All Applicants
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          Pending
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          Shortlisted
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          Hired
                        </Button>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" className="text-xs">
                          <BarChart2 className="h-3 w-3 mr-1" /> Sort by Rating
                        </Button>
                      </div>
                    </div>
                    {applicants.map((applicant) => (
                      <ApplicantItem
                        key={applicant.application_id}
                        applicant={applicant}
                        onStatusChange={updateApplicationStatus}
                      />
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No Applicants Yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Post your first job to start receiving applications
                    </p>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => navigate("/post-job")}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Post a Job
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-medium">Task Management</h3>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <PlusCircle className="h-4 w-4 mr-1" /> Add Task
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* To Do Column */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium mb-3 flex items-center">
                      <span className="h-2 w-2 rounded-full bg-gray-400 mr-2"></span>
                      To Do
                    </h4>
                    <div className="space-y-3">
                      <Card className="p-3 shadow-sm">
                        <h5 className="font-medium text-sm">
                          Update job descriptions
                        </h5>
                        <p className="text-xs text-gray-600 mt-1">
                          Review and update all active job listings
                        </p>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Due: Tomorrow
                          </span>
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                            />
                            <AvatarFallback>
                              {userProfile?.fullName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </Card>
                      <Card className="p-3 shadow-sm">
                        <h5 className="font-medium text-sm">
                          Schedule interviews
                        </h5>
                        <p className="text-xs text-gray-600 mt-1">
                          Contact shortlisted candidates
                        </p>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Due: Friday
                          </span>
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                            />
                            <AvatarFallback>
                              {userProfile?.fullName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* In Progress Column */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-medium mb-3 flex items-center">
                      <span className="h-2 w-2 rounded-full bg-blue-400 mr-2"></span>
                      In Progress
                    </h4>
                    <div className="space-y-3">
                      <Card className="p-3 shadow-sm">
                        <h5 className="font-medium text-sm">
                          Review applications
                        </h5>
                        <p className="text-xs text-gray-600 mt-1">
                          Review new applications for construction job
                        </p>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Due: Today
                          </span>
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                            />
                            <AvatarFallback>
                              {userProfile?.fullName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Completed Column */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h4 className="font-medium mb-3 flex items-center">
                      <span className="h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                      Completed
                    </h4>
                    <div className="space-y-3">
                      <Card className="p-3 shadow-sm">
                        <h5 className="font-medium text-sm">
                          Post new job listing
                        </h5>
                        <p className="text-xs text-gray-600 mt-1">
                          Create delivery driver job posting
                        </p>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Completed: Yesterday
                          </span>
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                            />
                            <AvatarFallback>
                              {userProfile?.fullName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="subscription" className="space-y-4">
                <div className="text-center py-4 mb-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">
                    Current Plan: Free
                  </h3>
                  <p className="text-sm text-blue-600 mb-4">
                    Upgrade to Premium for more features
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <DollarSign className="h-4 w-4 mr-1" /> Upgrade Now
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-2 border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-xl">Free Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold mb-6">
                        KSh 0{" "}
                        <span className="text-sm font-normal text-gray-500">
                          /month
                        </span>
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                          <span>Post up to 3 jobs per month</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                          <span>Basic applicant filtering</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                          <span>Standard job visibility</span>
                        </li>
                        <li className="flex items-start">
                          <XCircle className="h-5 w-5 text-gray-300 mr-2 shrink-0" />
                          <span className="text-gray-500">
                            Verified employer badge
                          </span>
                        </li>
                        <li className="flex items-start">
                          <XCircle className="h-5 w-5 text-gray-300 mr-2 shrink-0" />
                          <span className="text-gray-500">
                            Featured job listings
                          </span>
                        </li>
                      </ul>
                      <Button variant="outline" className="w-full mt-6">
                        Current Plan
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-500 relative">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                      RECOMMENDED
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">Premium Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold mb-6">
                        KSh 2,500{" "}
                        <span className="text-sm font-normal text-gray-500">
                          /month
                        </span>
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                          <span>Unlimited job postings</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                          <span>Advanced applicant filtering</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                          <span>Priority job visibility</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                          <span>Verified employer badge</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                          <span>Featured job listings</span>
                        </li>
                      </ul>
                      <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                        Upgrade Now
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Notifications */}
        <Card className="w-full bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${notification.read ? "bg-gray-50" : "bg-blue-50 border-blue-100"}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Bell
                        className={`h-5 w-5 mt-0.5 ${notification.read ? "text-gray-400" : "text-blue-500"}`}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(
                            notification.created_at,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-6">
                  No notifications.
                </p>
              )}

              {notifications.length > 0 && (
                <Button variant="outline" className="w-full mt-2">
                  View All Notifications
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
