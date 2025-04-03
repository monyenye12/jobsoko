import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  Search,
  Clock,
  Users,
  Edit,
  Trash2,
  Eye,
  PlusCircle,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  description: string;
  requirements?: string;
  responsibilities?: string;
  salary_min?: number;
  salary_max?: number;
  payment_frequency?: string;
  skills?: string[];
  deadline: string;
  status: "active" | "closed" | "draft";
  created_at: string;
  applications_count?: number;
}

export default function ManageJobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingJob, setDeletingJob] = useState(false);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch jobs posted by this employer
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", user.id)
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      // Get application counts for each job
      const jobsWithCounts = await Promise.all(
        (jobsData || []).map(async (job) => {
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
      toast({
        title: "Error",
        description: "Failed to load your jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditJob = (job: Job) => {
    navigate(`/dashboard/post-job?edit=${job.id}`);
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;

    try {
      setDeletingJob(true);

      // Check if there are any applications for this job
      const { count, error: countError } = await supabase
        .from("applications")
        .select("id", { count: "exact" })
        .eq("job_id", selectedJob.id);

      if (countError) throw countError;

      if (count && count > 0) {
        // If there are applications, just mark the job as closed instead of deleting
        const { error: updateError } = await supabase
          .from("jobs")
          .update({ status: "closed" })
          .eq("id", selectedJob.id);

        if (updateError) throw updateError;

        toast({
          title: "Job Closed",
          description:
            "The job has been closed instead of deleted because it has applications.",
          variant: "success",
        });
      } else {
        // If no applications, delete the job
        const { error: deleteError } = await supabase
          .from("jobs")
          .delete()
          .eq("id", selectedJob.id);

        if (deleteError) throw deleteError;

        toast({
          title: "Job Deleted",
          description: "The job has been permanently deleted.",
          variant: "success",
        });
      }

      // Refresh the jobs list
      fetchJobs();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingJob(false);
    }
  };

  const handleViewApplicants = (jobId: string) => {
    navigate(`/dashboard/applicants?job=${jobId}`);
  };

  const handleStatusChange = async (
    jobId: string,
    newStatus: "active" | "closed" | "draft",
  ) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", jobId);

      if (error) throw error;

      // Update local state
      setJobs(
        jobs.map((job) =>
          job.id === jobId ? { ...job, status: newStatus } : job,
        ),
      );

      toast({
        title: "Status Updated",
        description: `Job status has been updated to ${newStatus}`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating job status:", error);
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter jobs based on search term and status filter
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-2 text-gray-600">Loading your jobs...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Manage Jobs</h1>
          <p className="text-gray-600">View and manage your job listings</p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => navigate("/dashboard/post-job")}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Post New Job
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Job listings */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <div className="ml-3">{getStatusBadge(job.status)}</div>
                    </div>
                    <p className="text-gray-600">{job.company}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <p className="text-sm text-gray-500">
                      Posted on {formatDate(job.created_at)}
                    </p>
                    {job.deadline && (
                      <p className="text-sm text-red-500">
                        Deadline: {formatDate(job.deadline)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Briefcase className="h-4 w-4 mr-1" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{job.applications_count || 0} applicants</span>
                  </div>
                </div>

                {job.salary_min && (
                  <div className="mt-2 font-medium text-green-600">
                    {job.salary_min && job.salary_max
                      ? `KSh ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                      : `KSh ${job.salary_min.toLocaleString()}`}
                    /{job.payment_frequency || "month"}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewApplicants(job.id)}
                  >
                    <Eye className="mr-1 h-4 w-4" /> View Applicants (
                    {job.applications_count || 0})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditJob(job)}
                  >
                    <Edit className="mr-1 h-4 w-4" /> Edit Job
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      setSelectedJob(job);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </Button>

                  {job.status === "active" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600"
                      onClick={() => handleStatusChange(job.id, "closed")}
                    >
                      <Clock className="mr-1 h-4 w-4" /> Close Job
                    </Button>
                  ) : job.status === "closed" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600"
                      onClick={() => handleStatusChange(job.id, "active")}
                    >
                      <Clock className="mr-1 h-4 w-4" /> Reactivate
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter
                ? "Try adjusting your search filters."
                : "You haven't posted any jobs yet."}
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate("/dashboard/post-job")}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Post Your First Job
            </Button>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job? This action cannot be
              undone.
              {selectedJob?.applications_count &&
                selectedJob.applications_count > 0 && (
                  <p className="mt-2 text-amber-600">
                    This job has {selectedJob.applications_count} applications.
                    It will be marked as closed instead of being deleted.
                  </p>
                )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deletingJob}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteJob}
              disabled={deletingJob}
            >
              {deletingJob ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                "Delete Job"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
