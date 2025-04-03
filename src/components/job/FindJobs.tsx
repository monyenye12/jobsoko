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
import JobDetailDialog from "./JobDetailDialog";
import {
  MapPin,
  Briefcase,
  Search,
  Clock,
  Filter,
  BookmarkIcon,
  ArrowUpDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FindJobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchSavedJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
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

  const fetchSavedJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", user?.id);

      if (error) throw error;
      setSavedJobs(data?.map((item) => item.job_id) || []);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  const handleSaveJob = async (jobId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save jobs",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      if (savedJobs.includes(jobId)) {
        // Remove from saved jobs
        await supabase
          .from("saved_jobs")
          .delete()
          .eq("user_id", user.id)
          .eq("job_id", jobId);

        setSavedJobs(savedJobs.filter((id) => id !== jobId));
        toast({
          title: "Job Removed",
          description: "Job removed from saved jobs",
        });
      } else {
        // Add to saved jobs
        await supabase.from("saved_jobs").insert([
          {
            user_id: user.id,
            job_id: jobId,
            created_at: new Date().toISOString(),
          },
        ]);

        setSavedJobs([...savedJobs, jobId]);
        toast({
          title: "Job Saved",
          description: "Job added to saved jobs",
        });
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast({
        title: "Error",
        description: "Failed to save job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setShowJobDetail(true);
  };

  const handleApplySuccess = () => {
    setShowJobDetail(false);
    toast({
      title: "Application Submitted",
      description: "Your application has been submitted successfully",
      variant: "success",
    });
    // Redirect to my applications page after a short delay
    setTimeout(() => {
      navigate("/dashboard/my-applications");
    }, 1500);
  };

  // Filter and sort jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description &&
        job.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLocation =
      locationFilter === "" ||
      (job.location &&
        job.location.toLowerCase().includes(locationFilter.toLowerCase()));

    const matchesCategory =
      categoryFilter === "" || job.category === categoryFilter;

    const matchesType = typeFilter === "" || job.type === typeFilter;

    return matchesSearch && matchesLocation && matchesCategory && matchesType;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === "newest") {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === "oldest") {
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortBy === "salary-high") {
      const aSalary = a.salary_min || 0;
      const bSalary = b.salary_min || 0;
      return bSalary - aSalary;
    } else if (sortBy === "salary-low") {
      const aSalary = a.salary_min || 0;
      const bSalary = b.salary_min || 0;
      return aSalary - bSalary;
    }
    return 0;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "1 day ago";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-2 text-gray-600">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Find Jobs</h1>
        <p className="text-gray-600">Discover job opportunities in your area</p>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Location" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                <SelectItem value="nairobi">Nairobi</SelectItem>
                <SelectItem value="mombasa">Mombasa</SelectItem>
                <SelectItem value="kisumu">Kisumu</SelectItem>
                <SelectItem value="nakuru">Nakuru</SelectItem>
                <SelectItem value="eldoret">Eldoret</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="hospitality">Hospitality</SelectItem>
                <SelectItem value="farming">Farming</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="driving">Driving</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Job Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Temporary">Temporary</SelectItem>
                <SelectItem value="Gig">Gig</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            {filteredJobs.length} jobs found
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <div className="flex items-center">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="salary-high">Highest Salary</SelectItem>
                <SelectItem value="salary-low">Lowest Salary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Job listings */}
      <div className="grid grid-cols-1 gap-4">
        {sortedJobs.length > 0 ? (
          sortedJobs.map((job) => (
            <Card key={job.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <p className="text-gray-600">{job.company}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${savedJobs.includes(job.id) ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}`}
                      onClick={() => handleSaveJob(job.id)}
                    >
                      <BookmarkIcon
                        className="h-5 w-5"
                        fill={
                          savedJobs.includes(job.id) ? "currentColor" : "none"
                        }
                      />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Posted {formatDate(job.created_at)}</span>
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

                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.skills.map((skill: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 line-clamp-2 text-gray-600 text-sm">
                    {job.description}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewJob(job)}
                    >
                      View Details
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                      onClick={() => handleViewJob(job)}
                    >
                      Apply Now
                    </Button>
                  </div>
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
              Try adjusting your search filters or check back later for new
              opportunities.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setLocationFilter("");
                setCategoryFilter("");
                setTypeFilter("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Job detail dialog */}
      <JobDetailDialog
        job={selectedJob}
        open={showJobDetail}
        onOpenChange={setShowJobDetail}
        onApplySuccess={handleApplySuccess}
        isSaved={selectedJob ? savedJobs.includes(selectedJob.id) : false}
        onSave={() => selectedJob && handleSaveJob(selectedJob.id)}
      />
    </div>
  );
}
