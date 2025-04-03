import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Briefcase,
  FileText,
  AlertCircle,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    employer_id?: string;
  };
  status: "pending" | "shortlisted" | "interview" | "accepted" | "rejected";
  created_at: string;
  interview_date?: string;
  employer_contact?: string;
  notes?: string;
}

export default function MyApplications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      // Fetch real applications from the database
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          id,
          status,
          created_at,
          interview_date,
          resume_url,
          notes,
          job:job_id(id, title, company, location, salary, type, urgent, employer_id)
        `,
        )
        .eq("applicant_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        // Fall back to mock data if there's an error
        const mockApplications: Application[] = [
          {
            id: "1",
            job: {
              id: "job-1",
              title: "Construction Worker",
              company: "ABC Construction",
              location: "Westlands, Nairobi",
              salary: "KSh 800-1200/day",
              type: "Full-time",
              urgent: true,
              employer_id: "employer-1",
            },
            status: "interview",
            created_at: new Date(
              new Date().setDate(new Date().getDate() - 5),
            ).toISOString(),
            interview_date: new Date(
              new Date().setDate(new Date().getDate() + 2),
            ).toISOString(),
            employer_contact: "+254 712 345 678",
            notes: "Bring your ID and certificates",
          },
          {
            id: "2",
            job: {
              id: "job-2",
              title: "Delivery Driver",
              company: "Quick Deliveries",
              location: "Kilimani, Nairobi",
              salary: "KSh 700-900/day",
              type: "Part-time",
              urgent: false,
              employer_id: "employer-2",
            },
            status: "pending",
            created_at: new Date(
              new Date().setDate(new Date().getDate() - 2),
            ).toISOString(),
          },
          {
            id: "3",
            job: {
              id: "job-3",
              title: "Retail Assistant",
              company: "Retail Mart",
              location: "CBD, Nairobi",
              salary: "KSh 25,000/month",
              type: "Full-time",
              urgent: false,
              employer_id: "employer-3",
            },
            status: "shortlisted",
            created_at: new Date(
              new Date().setDate(new Date().getDate() - 7),
            ).toISOString(),
            employer_contact: "+254 723 456 789",
          },
          {
            id: "4",
            job: {
              id: "job-4",
              title: "Security Guard",
              company: "Secure Solutions",
              location: "Lavington, Nairobi",
              salary: "KSh 30,000/month",
              type: "Full-time",
              urgent: true,
              employer_id: "employer-4",
            },
            status: "rejected",
            created_at: new Date(
              new Date().setDate(new Date().getDate() - 14),
            ).toISOString(),
            notes: "Position filled",
          },
          {
            id: "5",
            job: {
              id: "job-5",
              title: "Farm Worker",
              company: "Green Farms Ltd",
              location: "Limuru, Kiambu",
              salary: "KSh 600-800/day",
              type: "Seasonal",
              urgent: false,
              employer_id: "employer-5",
            },
            status: "accepted",
            created_at: new Date(
              new Date().setDate(new Date().getDate() - 10),
            ).toISOString(),
            employer_contact: "+254 734 567 890",
            notes: "Start date: Next Monday",
          },
        ];

        setApplications(data || mockApplications);
      } else {
        setApplications(data || []);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </Badge>
        );
      case "shortlisted":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Shortlisted
          </Badge>
        );
      case "interview":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            Interview
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  const handleMessageEmployer = (application: Application) => {
    if (application.job.employer_id) {
      navigate(
        `/dashboard/messages?employer=${application.job.employer_id}&employer_name=${encodeURIComponent(application.job.company)}&job_id=${application.job.id}&job_title=${encodeURIComponent(application.job.title)}`,
      );
    } else {
      toast({
        title: "Error",
        description: "Employer contact information not available.",
        variant: "destructive",
      });
    }
  };

  // Filter applications based on search term
  const filteredApplications = applications.filter((application) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      application.job.title.toLowerCase().includes(searchLower) ||
      application.job.company.toLowerCase().includes(searchLower) ||
      application.job.location.toLowerCase().includes(searchLower) ||
      application.status.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
        <p className="ml-2">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl font-semibold flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              My Applications
            </CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" className="whitespace-nowrap">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="mt-2">
            <TabsList className="grid grid-cols-5 w-full max-w-md mx-auto mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
              <TabsTrigger value="interview">Interview</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {filteredApplications.length > 0 ? (
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <div
                      key={application.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {application.job.title}
                            </h3>
                            {getStatusBadge(application.status)}
                          </div>
                          <p className="text-gray-700 font-medium mt-1">
                            {application.job.company}
                          </p>

                          <div className="flex items-center text-gray-500 mt-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {application.job.location}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            <div className="flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {application.job.type}
                            </div>
                            <div className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-xs">
                              {application.job.salary}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 md:mt-0 flex flex-col gap-2">
                          {application.status === "interview" && (
                            <div className="flex items-center text-purple-600 mb-2">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span className="text-sm">
                                Interview:{" "}
                                {new Date(
                                  application.interview_date || "",
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          {application.employer_contact && (
                            <div className="flex items-center text-gray-600 mb-2">
                              <Phone className="h-4 w-4 mr-1" />
                              <span className="text-sm">
                                {application.employer_contact}
                              </span>
                            </div>
                          )}

                          <div className="flex gap-2 mt-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => handleMessageEmployer(application)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              onClick={() =>
                                navigate(`/dashboard/job/${application.job.id}`)
                              }
                            >
                              View Job
                            </Button>
                          </div>
                        </div>
                      </div>

                      {application.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-start">
                            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                            <p className="text-sm text-gray-600">
                              {application.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No applications yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Start applying for jobs to see your applications here.
                  </p>
                  <Button onClick={() => navigate("/dashboard/find-jobs")}>
                    Find Jobs
                  </Button>
                </div>
              )}
            </TabsContent>

            {["pending", "shortlisted", "interview", "accepted"].map(
              (status) => (
                <TabsContent key={status} value={status}>
                  {filteredApplications.filter((app) => app.status === status)
                    .length > 0 ? (
                    <div className="space-y-4">
                      {filteredApplications
                        .filter((app) => app.status === status)
                        .map((application) => (
                          <div
                            key={application.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-lg text-gray-900">
                                    {application.job.title}
                                  </h3>
                                  {getStatusBadge(application.status)}
                                </div>
                                <p className="text-gray-700 font-medium mt-1">
                                  {application.job.company}
                                </p>

                                <div className="flex items-center text-gray-500 mt-2">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span className="text-sm">
                                    {application.job.location}
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-3">
                                  <div className="flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs">
                                    <Briefcase className="h-3 w-3 mr-1" />
                                    {application.job.type}
                                  </div>
                                  <div className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-xs">
                                    {application.job.salary}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 md:mt-0 flex flex-col gap-2">
                                {application.status === "interview" && (
                                  <div className="flex items-center text-purple-600 mb-2">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span className="text-sm">
                                      Interview:{" "}
                                      {new Date(
                                        application.interview_date || "",
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}

                                {application.employer_contact && (
                                  <div className="flex items-center text-gray-600 mb-2">
                                    <Phone className="h-4 w-4 mr-1" />
                                    <span className="text-sm">
                                      {application.employer_contact}
                                    </span>
                                  </div>
                                )}

                                <div className="flex gap-2 mt-auto">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                    onClick={() =>
                                      handleMessageEmployer(application)
                                    }
                                  >
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Message
                                  </Button>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-gray-600 border-gray-200 hover:bg-gray-50"
                                    onClick={() =>
                                      navigate(
                                        `/dashboard/job/${application.job.id}`,
                                      )
                                    }
                                  >
                                    View Job
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {application.notes && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-start">
                                  <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                                  <p className="text-sm text-gray-600">
                                    {application.notes}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        No {status} applications
                      </h3>
                      <p className="text-gray-500 mb-4">
                        You don't have any applications with {status} status.
                      </p>
                      <Button onClick={() => navigate("/dashboard/find-jobs")}>
                        Find Jobs
                      </Button>
                    </div>
                  )}
                </TabsContent>
              ),
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
