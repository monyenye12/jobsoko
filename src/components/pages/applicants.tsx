import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Star,
  MessageSquare,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Filter,
} from "lucide-react";

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
  resume_url?: string;
  notes?: string;
  cover_letter?: string;
}

export default function ApplicantsPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("job");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedResume, setSelectedResume] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  useEffect(() => {
    if (user && jobId) {
      fetchJobDetails();
      fetchApplicants();
    }
  }, [user, jobId]);

  const fetchJobDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (error) throw error;
      setJobDetails(data);
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      });
    }
  };

  const fetchApplicants = async () => {
    try {
      // Get all applications for this job
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          id,
          job_id,
          status,
          created_at,
          resume_url,
          notes,
          cover_letter,
          applicant:applicant_id(id, full_name, email, skills, rating, resume_url)
        `,
        )
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Format the applicants data
      const formattedApplicants = data?.map((app) => {
        return {
          id: app.applicant.id,
          application_id: app.id,
          job_id: app.job_id,
          job_title: jobDetails?.title || "Unknown Job",
          full_name: app.applicant.full_name,
          email: app.applicant.email,
          status: app.status,
          created_at: app.created_at,
          skills: app.applicant.skills || [],
          rating: app.applicant.rating || 0,
          resume_url: app.resume_url || app.applicant.resume_url,
          notes: app.notes,
          cover_letter: app.cover_letter,
        };
      });

      setApplicants(formattedApplicants || []);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      toast({
        title: "Error",
        description: "Failed to load applicants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewResume = (resumeUrl: string, applicantName: string) => {
    setSelectedResume({ url: resumeUrl, name: applicantName });
    setShowResumeDialog(true);
  };

  const handleMessageApplicant = (
    applicantId: string,
    applicantName: string,
  ) => {
    // Navigate to messages page with applicant ID and name as query parameters
    // This will automatically open a conversation with this applicant
    navigate(
      `/dashboard/messages?applicant=${applicantId}&name=${encodeURIComponent(applicantName)}`,
    );

    // Create a notification for the applicant that they have a new message
    try {
      supabase.from("notifications").insert([
        {
          user_id: applicantId,
          title: "New Message",
          message: `${userProfile?.fullName || "An employer"} has sent you a message about your application`,
          type: "message",
          read: false,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string,
  ) => {
    try {
      // Update the application status in the database
      const { error } = await supabase
        .from("applications")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
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

      // Create a notification for the applicant
      const applicant = applicants.find(
        (a) => a.application_id === applicationId,
      );

      if (applicant) {
        // Format status message for better readability
        let statusMessage = "";
        switch (newStatus) {
          case "accepted":
            statusMessage =
              "accepted! Congratulations! The employer will contact you soon with next steps.";
            break;
          case "rejected":
            statusMessage =
              "not selected for this position. Thank you for your interest.";
            break;
          case "interview":
            statusMessage =
              "selected for an interview! The employer will contact you to schedule.";
            break;
          default:
            statusMessage = newStatus;
        }

        // Insert notification
        await supabase.from("notifications").insert([
          {
            user_id: applicant.id,
            title: "Application Status Updated",
            message: `Your application for "${applicant.job_title}" has been ${statusMessage}`,
            type: "application_update",
            read: false,
            created_at: new Date().toISOString(),
          },
        ]);

        // If status is interview, create a calendar event suggestion
        if (newStatus === "interview") {
          // Create a suggested interview time (3 days from now at 10 AM)
          const interviewDate = new Date();
          interviewDate.setDate(interviewDate.getDate() + 3);
          interviewDate.setHours(10, 0, 0, 0);

          try {
            await supabase.from("calendar_events").insert([
              {
                user_id: applicant.id,
                title: `Interview for ${applicant.job_title}`,
                description: `Interview with ${userProfile?.businessName || company || "employer"} for the ${applicant.job_title} position`,
                start_time: interviewDate.toISOString(),
                end_time: new Date(
                  interviewDate.getTime() + 60 * 60 * 1000,
                ).toISOString(), // 1 hour interview
                location: location || "To be determined",
                status: "pending",
                created_at: new Date().toISOString(),
                event_type: "interview",
                related_job_id: jobId,
              },
            ]);
          } catch (calendarError) {
            console.error("Error creating calendar event:", calendarError);
          }
        }
      }

      toast({
        title: "Status Updated",
        description: `Applicant status has been updated to ${newStatus}`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
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

  // Filter applicants based on search term and status
  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      searchTerm === "" ||
      applicant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (applicant.skills &&
        applicant.skills.some((skill) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase()),
        ));

    const matchesStatus =
      statusFilter === "" || applicant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-2 text-gray-600">Loading applicants...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Resume Viewer Dialog */}
      {showResumeDialog && selectedResume && (
        <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Resume: {selectedResume.name}</DialogTitle>
            </DialogHeader>
            <div className="h-[70vh] overflow-auto border rounded-md p-2">
              {selectedResume.url.endsWith(".pdf") ? (
                <iframe
                  src={selectedResume.url}
                  className="w-full h-full"
                  title={`${selectedResume.name}'s Resume`}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <a
                    href={selectedResume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center text-blue-600 hover:underline"
                  >
                    <FileText className="h-16 w-16 mb-2" />
                    <span>Click to open resume in new tab</span>
                  </a>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowResumeDialog(false)}>Close</Button>
              <Button
                variant="outline"
                onClick={() => window.open(selectedResume.url, "_blank")}
              >
                Open in New Tab
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/dashboard/manage-jobs")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
        </Button>
        <h1 className="text-2xl font-bold">
          Applicants for {jobDetails?.title || "Job"}
        </h1>
        <p className="text-gray-600">
          {filteredApplicants.length} applicants found
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Applicants list */}
      <div className="space-y-4">
        {filteredApplicants.length > 0 ? (
          filteredApplicants.map((applicant) => (
            <Card key={applicant.application_id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${applicant.full_name}`}
                      />
                      <AvatarFallback>{applicant.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-lg">
                        {applicant.full_name}
                      </h3>
                      <p className="text-sm text-gray-500">{applicant.email}</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm">
                          {applicant.rating || "N/A"} Rating
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex flex-col items-end">
                    {getStatusBadge(applicant.status)}
                    <span className="text-xs text-gray-500 mt-1">
                      Applied on{" "}
                      {new Date(applicant.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {applicant.skills && applicant.skills.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-1">
                      {applicant.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {applicant.cover_letter && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-sm mb-1">Cover Letter:</h4>
                    <p className="text-sm text-gray-700">
                      {applicant.cover_letter}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                    onClick={() =>
                      updateApplicationStatus(
                        applicant.application_id,
                        "accepted",
                      )
                    }
                  >
                    <CheckCircle className="h-3 w-3 mr-1" /> Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                    onClick={() =>
                      updateApplicationStatus(
                        applicant.application_id,
                        "interview",
                      )
                    }
                  >
                    <Clock className="h-3 w-3 mr-1" /> Schedule Interview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    onClick={() =>
                      updateApplicationStatus(
                        applicant.application_id,
                        "rejected",
                      )
                    }
                  >
                    <XCircle className="h-3 w-3 mr-1" /> Reject
                  </Button>
                  {applicant.resume_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
                      onClick={() =>
                        handleViewResume(
                          applicant.resume_url || "",
                          applicant.full_name,
                        )
                      }
                    >
                      <FileText className="h-3 w-3 mr-1" /> View CV
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() =>
                      handleMessageApplicant(applicant.id, applicant.full_name)
                    }
                  >
                    <MessageSquare className="h-3 w-3 mr-1" /> Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No applicants found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter
                ? "Try adjusting your search filters."
                : "No one has applied for this job yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
