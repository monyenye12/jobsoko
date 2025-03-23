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

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      // In a real app, this would fetch from the database
      // For demo, we'll use mock data
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
          },
          status: "accepted",
          created_at: new Date(
            new Date().setDate(new Date().getDate() - 10),
          ).toISOString(),
          employer_contact: "+254 734 567 890",
          notes: "Start date: Next Monday",
        },
      ];

      setApplications(mockApplications);
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

                        <div className="mt-4 md:mt-0 md:text-right">
                          <p className="text-sm text-gray-500">
                            <Clock className="inline h-3 w-3 mr-1" />
                            Applied{" "}
                            {new Date(
                              application.created_at,
                            ).toLocaleDateString()}
                          </p>

                          {application.interview_date && (
                            <p className="text-sm text-purple-600 mt-1">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              Interview:{" "}
                              {new Date(
                                application.interview_date,
                              ).toLocaleDateString()}
                            </p>
                          )}

                          {application.employer_contact && (
                            <p className="text-sm text-blue-600 mt-1">
                              <Phone className="inline h-3 w-3 mr-1" />
                              Contact: {application.employer_contact}
                            </p>
                          )}

                          <div className="mt-3">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 mr-2"
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Message
                            </Button>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>

                      {application.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span>{" "}
                            {application.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Briefcase className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium">No applications found</h3>
                  <p className="text-gray-500 mt-1 mb-6">
                    {searchTerm
                      ? `No applications match "${searchTerm}". Try a different search term.`
                      : "You haven't applied to any jobs yet. Browse jobs and start applying!"}
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Find Jobs
                  </Button>
                </div>
              )}
            </TabsContent>

            {[
              "pending",
              "shortlisted",
              "interview",
              "accepted",
              "rejected",
            ].map((status) => (
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

                            <div className="mt-4 md:mt-0 md:text-right">
                              <p className="text-sm text-gray-500">
                                <Clock className="inline h-3 w-3 mr-1" />
                                Applied{" "}
                                {new Date(
                                  application.created_at,
                                ).toLocaleDateString()}
                              </p>

                              {application.interview_date && (
                                <p className="text-sm text-purple-600 mt-1">
                                  <Calendar className="inline h-3 w-3 mr-1" />
                                  Interview:{" "}
                                  {new Date(
                                    application.interview_date,
                                  ).toLocaleDateString()}
                                </p>
                              )}

                              {application.employer_contact && (
                                <p className="text-sm text-blue-600 mt-1">
                                  <Phone className="inline h-3 w-3 mr-1" />
                                  Contact: {application.employer_contact}
                                </p>
                              )}

                              <div className="mt-3">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 mr-2"
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Message
                                </Button>
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>

                          {application.notes && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Notes:</span>{" "}
                                {application.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <AlertCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium">
                      No {status} applications
                    </h3>
                    <p className="text-gray-500 mt-1 mb-6">
                      {searchTerm
                        ? `No ${status} applications match "${searchTerm}". Try a different search term.`
                        : `You don't have any applications with ${status} status.`}
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
