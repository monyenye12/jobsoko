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
} from "lucide-react";
import JobCard from "../job/JobCard";

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

function ApplicationItem({ application }: { application: Application }) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{application.job.title}</h3>
          <p className="text-sm text-gray-600">{application.job.company}</p>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{application.job.location}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {getStatusBadge(application.status)}
          <span className="text-xs text-gray-500 mt-1">
            Applied on {new Date(application.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {application.status === "interview" && application.interview_date && (
        <div className="mt-3 p-2 bg-blue-50 rounded-md text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-blue-500 mr-2" />
            <span className="font-medium">
              Interview scheduled for{" "}
              {new Date(application.interview_date).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <Button variant="outline" size="sm" className="text-xs">
          <MessageSquare className="h-3 w-3 mr-1" /> Message Employer
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          View Details
        </Button>
      </div>
    </div>
  );
}

export default function JobSeekerDashboard() {
  const { user, userProfile } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApplications();
      fetchNotifications();
      fetchRecommendedJobs();
    }
  }, [user]);

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

  const fetchRecommendedJobs = async () => {
    try {
      // In a real app, this would use the user's skills and location to find matching jobs
      // For demo purposes, we'll just fetch recent jobs
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecommendedJobs(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching recommended jobs:", error);
      setLoading(false);
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
        {/* Profile Summary */}
        <Card className="md:w-1/3 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                />
                <AvatarFallback>{userProfile?.fullName?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-lg">{userProfile?.fullName}</h3>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm">
                    {userProfile?.rating || "No ratings"}
                  </span>
                </div>
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
                <Briefcase className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Preferred Category</p>
                  <p className="text-sm text-gray-600">
                    {userProfile?.preferredCategory || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Resume</p>
                  <div className="flex items-center mt-1">
                    {userProfile?.resume ? (
                      <>
                        <p className="text-sm text-gray-600 mr-2">resume.pdf</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Download className="h-4 w-4 text-gray-500" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs py-0 h-7"
                      >
                        <Upload className="h-3 w-3 mr-1" /> Upload Resume
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Skills</p>
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
                    <p className="text-sm text-gray-500">No skills specified</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1">
                <Settings className="h-4 w-4 mr-1" /> Edit Profile
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                <FileText className="h-4 w-4 mr-1" /> View Resume
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Application Stats */}
        <Card className="md:w-2/3 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-blue-700">Pending</p>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {
                      applications.filter((app) => app.status === "pending")
                        .length
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-100">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-green-700">
                      Accepted
                    </p>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {
                      applications.filter((app) => app.status === "accepted")
                        .length
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-100">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-red-700">Rejected</p>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {
                      applications.filter((app) => app.status === "rejected")
                        .length
                    }
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Applications</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {applications.length > 0 ? (
                  applications.map((application) => (
                    <ApplicationItem
                      key={application.id}
                      application={application}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6">
                    You haven't applied to any jobs yet.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                {applications.filter((app) => app.status === "pending").length >
                0 ? (
                  applications
                    .filter((app) => app.status === "pending")
                    .map((application) => (
                      <ApplicationItem
                        key={application.id}
                        application={application}
                      />
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-6">
                    No pending applications.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="accepted" className="space-y-4">
                {applications.filter((app) => app.status === "accepted")
                  .length > 0 ? (
                  applications
                    .filter((app) => app.status === "accepted")
                    .map((application) => (
                      <ApplicationItem
                        key={application.id}
                        application={application}
                      />
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-6">
                    No accepted applications.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4">
                {applications.filter((app) => app.status === "rejected")
                  .length > 0 ? (
                  applications
                    .filter((app) => app.status === "rejected")
                    .map((application) => (
                      <ApplicationItem
                        key={application.id}
                        application={application}
                      />
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-6">
                    No rejected applications.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Recommended Jobs */}
        <Card className="md:w-2/3 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium">
                Recommended Jobs
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-3 w-3 mr-1" /> Filter
                </Button>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    placeholder="Search jobs..."
                    className="h-8 pl-7 text-sm w-[180px]"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recommended">
              <TabsList className="mb-4">
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="nearby">Nearby</TabsTrigger>
                <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
                <TabsTrigger value="recent">Recently Posted</TabsTrigger>
              </TabsList>

              <TabsContent value="recommended" className="space-y-4">
                {recommendedJobs.length > 0 ? (
                  recommendedJobs.map((job: any) => (
                    <div key={job.id} className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-400 hover:text-yellow-500 z-10"
                      >
                        <BookmarkIcon className="h-4 w-4" />
                      </Button>
                      <JobCard
                        title={job.title}
                        company={job.company}
                        location={job.location}
                        salary={job.salary}
                        type={job.type}
                        posted={`Posted ${new Date(job.created_at).toLocaleDateString()}`}
                        skills={job.skills}
                        urgent={job.urgent}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6">
                    No recommended jobs available.
                  </p>
                )}

                <Button className="w-full mt-2 bg-green-600 hover:bg-green-700">
                  View All Jobs
                </Button>
              </TabsContent>

              <TabsContent value="nearby" className="space-y-4">
                <div className="p-8 border border-dashed rounded-lg flex flex-col items-center justify-center">
                  <MapPin className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Enable Location Services
                  </h3>
                  <p className="text-gray-500 text-center mb-4">
                    Allow JobSoko to access your location to see jobs near you
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <MapPin className="h-4 w-4 mr-2" /> Enable Location
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="saved" className="space-y-4">
                <p className="text-gray-500 text-center py-6">
                  You haven't saved any jobs yet. Click the bookmark icon to
                  save jobs for later.
                </p>
              </TabsContent>

              <TabsContent value="recent" className="space-y-4">
                {recommendedJobs.length > 0 ? (
                  recommendedJobs.map((job: any) => (
                    <div key={job.id} className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-400 hover:text-yellow-500 z-10"
                      >
                        <BookmarkIcon className="h-4 w-4" />
                      </Button>
                      <JobCard
                        title={job.title}
                        company={job.company}
                        location={job.location}
                        salary={job.salary}
                        type={job.type}
                        posted={`Posted ${new Date(job.created_at).toLocaleDateString()}`}
                        skills={job.skills}
                        urgent={job.urgent}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6">
                    No recent jobs available.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="md:w-1/3 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Notifications</CardTitle>
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
