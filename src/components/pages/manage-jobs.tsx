import React, { useState, useEffect } from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNavigate } from "react-router-dom";
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
  Edit,
  Trash2,
  Eye,
  PlusCircle,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
  description: string;
  requirements: string[];
  salary: string;
  type: string;
  status: "active" | "closed" | "draft";
  created_at: string;
  applications_count: number;
  urgent: boolean;
}

const ManageJobsPage = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedJob, setEditedJob] = useState<Partial<Job>>({});

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      // In a real app, this would fetch from the database
      // For demo, we'll use mock data
      const mockJobs: Job[] = [
        {
          id: "1",
          title: "Construction Worker",
          company: userProfile?.businessName || "Your Company",
          location: "Westlands, Nairobi",
          description:
            "We are looking for experienced construction workers for a commercial building project in Westlands. Must have at least 2 years of experience in construction work. Daily wages with possibility of long-term employment.",
          requirements: [
            "2+ years experience",
            "Own basic tools",
            "Ability to work in a team",
            "Available immediately",
          ],
          salary: "KSh 800-1200/day",
          type: "Full-time",
          status: "active",
          created_at: new Date(
            new Date().setDate(new Date().getDate() - 2),
          ).toISOString(),
          applications_count: 12,
          urgent: true,
        },
        {
          id: "2",
          title: "Delivery Driver",
          company: userProfile?.businessName || "Your Company",
          location: "Kilimani, Nairobi",
          description:
            "Looking for motorcycle delivery drivers to join our growing team. Must have own motorcycle and valid driving license. Flexible hours and competitive pay per delivery.",
          requirements: [
            "Valid driving license",
            "Own motorcycle",
            "Smartphone with data plan",
            "Knowledge of Nairobi roads",
          ],
          salary: "KSh 500-700/day",
          type: "Part-time",
          status: "active",
          created_at: new Date(
            new Date().setDate(new Date().getDate() - 1),
          ).toISOString(),
          applications_count: 5,
          urgent: false,
        },
        {
          id: "3",
          title: "Shop Assistant",
          company: userProfile?.businessName || "Your Company",
          location: "CBD, Nairobi",
          description:
            "Retail Mart is hiring shop assistants for our CBD branch. Responsibilities include customer service, stock arrangement, and sales. Previous retail experience is a plus but not required.",
          requirements: [
            "Good communication skills",
            "Basic math skills",
            "Ability to stand for long hours",
            "Customer-oriented attitude",
          ],
          salary: "KSh 15,000/month",
          type: "Full-time",
          status: "closed",
          created_at: new Date(
            new Date().setDate(new Date().getDate() - 10),
          ).toISOString(),
          applications_count: 20,
          urgent: false,
        },
        {
          id: "4",
          title: "Security Guard",
          company: userProfile?.businessName || "Your Company",
          location: "Lavington, Nairobi",
          description:
            "SecureLife is hiring security guards for residential properties in Lavington. 12-hour shifts, day and night positions available.",
          requirements: [
            "Security training certificate",
            "Clean record",
            "Minimum height 5'7\"",
            "Good physical condition",
          ],
          salary: "KSh 18,000/month",
          type: "Full-time",
          status: "draft",
          created_at: new Date(
            new Date().setDate(new Date().getDate() - 5),
          ).toISOString(),
          applications_count: 0,
          urgent: false,
        },
      ];

      setJobs(mockJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = (job: Job) => {
    setSelectedJob(job);
    setShowDeleteDialog(true);
  };

  const confirmDeleteJob = async () => {
    if (!selectedJob) return;

    try {
      // In a real app, this would delete from the database
      setJobs((prev) => prev.filter((job) => job.id !== selectedJob.id));
      toast({
        title: "Job deleted",
        description: "The job has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedJob(null);
    }
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setEditedJob({
      title: job.title,
      location: job.location,
      description: job.description,
      salary: job.salary,
      type: job.type,
      status: job.status,
      urgent: job.urgent,
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedJob) return;

    try {
      // In a real app, this would update the database
      setJobs((prev) =>
        prev.map((job) =>
          job.id === selectedJob.id ? { ...job, ...editedJob } : job,
        ),
      );
      toast({
        title: "Job updated",
        description: "The job has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: "Failed to update job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowEditDialog(false);
      setSelectedJob(null);
      setEditedJob({});
    }
  };

  const handleStatusChange = async (
    jobId: string,
    newStatus: "active" | "closed" | "draft",
  ) => {
    try {
      // In a real app, this would update the database
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: newStatus } : job,
        ),
      );
      toast({
        title: "Status updated",
        description: `Job status changed to ${newStatus}`,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Active
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Closed
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Draft
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

  // Filter jobs based on search term and status filter
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === null || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activeItem="Manage Jobs" />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle className="text-xl font-semibold flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 text-blue-500" />
                    Manage Jobs
                  </CardTitle>
                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Select
                      value={statusFilter || ""}
                      onValueChange={(value) =>
                        setStatusFilter(value === "" ? null : value)
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => navigate("/post-job")}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Post Job
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                    <p className="ml-2">Loading jobs...</p>
                  </div>
                ) : filteredJobs.length > 0 ? (
                  <div className="space-y-4 mt-4">
                    {filteredJobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {job.title}
                              </h3>
                              {getStatusBadge(job.status)}
                              {job.urgent && (
                                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-700 font-medium mt-1">
                              {job.company}
                            </p>

                            <div className="flex items-center text-gray-500 mt-2">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="text-sm">{job.location}</span>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">
                              <div className="flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {job.type}
                              </div>
                              <div className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-xs">
                                {job.salary}
                              </div>
                              <div className="flex items-center bg-purple-50 text-purple-700 rounded-full px-3 py-1 text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                {job.applications_count} applicants
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 md:mt-0 md:text-right">
                            <p className="text-sm text-gray-500">
                              <Clock className="inline h-3 w-3 mr-1" />
                              Posted{" "}
                              {new Date(job.created_at).toLocaleDateString()}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center"
                                onClick={() =>
                                  navigate(
                                    `/dashboard/applicants?job=${job.id}`,
                                  )
                                }
                              >
                                <Users className="h-3 w-3 mr-1" />
                                View Applicants
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center"
                                onClick={() => handleEditJob(job)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleDeleteJob(job)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>

                            <div className="mt-3">
                              {job.status === "active" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() =>
                                    handleStatusChange(job.id, "closed")
                                  }
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Mark as Closed
                                </Button>
                              ) : job.status === "closed" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() =>
                                    handleStatusChange(job.id, "active")
                                  }
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Reactivate Job
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() =>
                                    handleStatusChange(job.id, "active")
                                  }
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Publish Job
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            <span className="font-medium">Description:</span>{" "}
                            {job.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Briefcase className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium">No jobs found</h3>
                    <p className="text-gray-500 mt-1 mb-6">
                      {searchTerm || statusFilter
                        ? "No jobs match your search criteria. Try different filters."
                        : "You haven't posted any jobs yet. Create your first job posting!"}
                    </p>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => navigate("/post-job")}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Post a Job
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete the job posting for{" "}
              <strong>{selectedJob?.title}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteJob}>
              Delete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Title</label>
                <Input
                  value={editedJob.title || ""}
                  onChange={(e) =>
                    setEditedJob({ ...editedJob, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={editedJob.location || ""}
                  onChange={(e) =>
                    setEditedJob({ ...editedJob, location: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Salary</label>
                <Input
                  value={editedJob.salary || ""}
                  onChange={(e) =>
                    setEditedJob({ ...editedJob, salary: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Type</label>
                <Select
                  value={editedJob.type || ""}
                  onValueChange={(value) =>
                    setEditedJob({ ...editedJob, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                    <SelectItem value="Seasonal">Seasonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={editedJob.status || ""}
                  onValueChange={(value: any) =>
                    setEditedJob({ ...editedJob, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={editedJob.urgent || false}
                    onChange={(e) =>
                      setEditedJob({ ...editedJob, urgent: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="urgent" className="text-sm font-medium">
                    Mark as Urgent
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={editedJob.description || ""}
                onChange={(e) =>
                  setEditedJob({ ...editedJob, description: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSaveEdit}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageJobsPage;
