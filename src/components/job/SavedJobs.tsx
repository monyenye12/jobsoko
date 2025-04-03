import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import {
  Search,
  Filter,
  BookmarkX,
  Briefcase,
  X,
  Calendar,
} from "lucide-react";
import JobCard from "./JobCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

interface SavedJob {
  id: string;
  job_id: string;
  user_id: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    posted: string;
    skills: string[];
    urgent: boolean;
  };
}

export default function SavedJobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showExpired, setShowExpired] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSavedJobs();
    }
  }, [user]);

  const fetchSavedJobs = async () => {
    try {
      // Get current date for deadline comparison
      const currentDate = new Date().toISOString().split("T")[0];

      let query = supabase
        .from("saved_jobs")
        .select(
          `
          id,
          job_id,
          user_id,
          created_at,
          job:job_id(id, title, company, location, salary, type, skills, urgent, created_at, deadline, salary_min, salary_max, payment_frequency)
        `,
        )
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      // Only show non-expired jobs by default
      if (!showExpired) {
        query = query.gte("job.deadline", currentDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSavedJobs(data || []);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to apply a filter
  const applyFilter = (filterType: string, value: any) => {
    switch (filterType) {
      case "location":
        setLocationFilter(value);
        if (value && !activeFilters.includes("location")) {
          setActiveFilters([...activeFilters, "location"]);
        } else if (!value && activeFilters.includes("location")) {
          setActiveFilters(activeFilters.filter((f) => f !== "location"));
        }
        break;
      case "jobType":
        setJobTypeFilter(value);
        if (value && !activeFilters.includes("jobType")) {
          setActiveFilters([...activeFilters, "jobType"]);
        } else if (!value && activeFilters.includes("jobType")) {
          setActiveFilters(activeFilters.filter((f) => f !== "jobType"));
        }
        break;
      case "skills":
        setSkillsFilter(value);
        if (value && !activeFilters.includes("skills")) {
          setActiveFilters([...activeFilters, "skills"]);
        } else if (!value && activeFilters.includes("skills")) {
          setActiveFilters(activeFilters.filter((f) => f !== "skills"));
        }
        break;
      case "urgent":
        setUrgentOnly(value);
        if (value && !activeFilters.includes("urgent")) {
          setActiveFilters([...activeFilters, "urgent"]);
        } else if (!value && activeFilters.includes("urgent")) {
          setActiveFilters(activeFilters.filter((f) => f !== "urgent"));
        }
        break;
      case "expired":
        setShowExpired(value);
        fetchSavedJobs(); // Refetch when this changes
        break;
      default:
        break;
    }
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setLocationFilter("");
    setJobTypeFilter("");
    setSkillsFilter("");
    setUrgentOnly(false);
    setActiveFilters([]);
  };

  // Function to remove a specific filter
  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case "location":
        setLocationFilter("");
        break;
      case "jobType":
        setJobTypeFilter("");
        break;
      case "skills":
        setSkillsFilter("");
        break;
      case "urgent":
        setUrgentOnly(false);
        break;
      default:
        break;
    }
    setActiveFilters(activeFilters.filter((f) => f !== filterType));
  };

  const removeSavedJob = async (savedJobId: string) => {
    try {
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("id", savedJobId);

      if (error) throw error;

      setSavedJobs((prev) => prev.filter((job) => job.id !== savedJobId));
      toast({
        title: "Job removed",
        description: "The job has been removed from your saved jobs.",
      });
    } catch (error) {
      console.error("Error removing saved job:", error);
      toast({
        title: "Error",
        description: "Failed to remove job. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Apply all filters to jobs
  const filteredJobs = savedJobs.filter((savedJob) => {
    // Search term filter
    const matchesSearch =
      !searchTerm ||
      savedJob.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      savedJob.job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      savedJob.job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      savedJob.job.skills?.some((skill: string) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    // Location filter
    const matchesLocation =
      !locationFilter ||
      savedJob.job.location
        ?.toLowerCase()
        .includes(locationFilter.toLowerCase());

    // Job type filter
    const matchesJobType =
      !jobTypeFilter ||
      savedJob.job.type?.toLowerCase() === jobTypeFilter.toLowerCase();

    // Skills filter
    const matchesSkills =
      !skillsFilter ||
      savedJob.job.skills?.some((skill: string) =>
        skill.toLowerCase().includes(skillsFilter.toLowerCase()),
      );

    // Urgent filter
    const matchesUrgent = !urgentOnly || savedJob.job.urgent;

    return (
      matchesSearch &&
      matchesLocation &&
      matchesJobType &&
      matchesSkills &&
      matchesUrgent
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl font-semibold flex items-center">
              <BookmarkX className="mr-2 h-5 w-5 text-yellow-500" />
              Saved Jobs
            </CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search saved jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Popover open={showFilters} onOpenChange={setShowFilters}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="whitespace-nowrap">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter{" "}
                    {activeFilters.length > 0 && `(${activeFilters.length})`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    <h3 className="font-medium">Filter Saved Jobs</h3>

                    {/* Location filter */}
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g. Westlands, Nairobi"
                        value={locationFilter}
                        onChange={(e) =>
                          applyFilter("location", e.target.value)
                        }
                      />
                    </div>

                    {/* Job Type filter */}
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type</Label>
                      <Select
                        value={jobTypeFilter}
                        onValueChange={(value) => applyFilter("jobType", value)}
                      >
                        <SelectTrigger id="jobType">
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Types</SelectItem>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Temporary">Temporary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Skills filter */}
                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills</Label>
                      <Input
                        id="skills"
                        placeholder="e.g. Driving, Construction"
                        value={skillsFilter}
                        onChange={(e) => applyFilter("skills", e.target.value)}
                      />
                    </div>

                    {/* Urgent Jobs filter */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="urgent"
                        checked={urgentOnly}
                        onCheckedChange={(checked) =>
                          applyFilter("urgent", checked === true)
                        }
                      />
                      <label
                        htmlFor="urgent"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Show urgent jobs only
                      </label>
                    </div>

                    {/* Show expired jobs filter */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="expired"
                        checked={showExpired}
                        onCheckedChange={(checked) =>
                          applyFilter("expired", checked === true)
                        }
                      />
                      <label
                        htmlFor="expired"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Show expired jobs
                      </label>
                    </div>

                    <div className="flex justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                      >
                        Clear All
                      </Button>
                      <Button size="sm" onClick={() => setShowFilters(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Active filters display */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.includes("location") && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Location: {locationFilter}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFilter("location")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {activeFilters.includes("jobType") && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {jobTypeFilter}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFilter("jobType")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {activeFilters.includes("skills") && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Skills: {skillsFilter}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFilter("skills")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {activeFilters.includes("urgent") && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Urgent Only
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFilter("urgent")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {activeFilters.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={clearAllFilters}
                >
                  Clear All
                </Button>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {filteredJobs.map((savedJob) => (
                <div key={savedJob.id} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 text-yellow-500 z-10"
                    onClick={() => removeSavedJob(savedJob.id)}
                  >
                    <BookmarkX className="h-4 w-4" />
                  </Button>
                  <JobCard
                    title={savedJob.job.title}
                    company={savedJob.job.company || "Unknown Company"}
                    location={savedJob.job.location}
                    salary={
                      savedJob.job.salary_min
                        ? `KSh ${savedJob.job.salary_min}${savedJob.job.salary_max ? ` - ${savedJob.job.salary_max}` : ""}/` +
                          (
                            savedJob.job.payment_frequency || "month"
                          ).toLowerCase()
                        : savedJob.job.salary || "Negotiable"
                    }
                    type={savedJob.job.type}
                    posted={`Saved on ${new Date(savedJob.created_at).toLocaleDateString()}`}
                    skills={savedJob.job.skills || []}
                    urgent={savedJob.job.urgent || false}
                    saved={true}
                  />
                  {savedJob.job.deadline && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Deadline:{" "}
                      {new Date(savedJob.job.deadline).toLocaleDateString()}
                      {new Date(savedJob.job.deadline) < new Date() && (
                        <Badge
                          variant="outline"
                          className="ml-2 text-red-500 border-red-200 text-[10px] py-0"
                        >
                          Expired
                        </Badge>
                      )}
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
              <h3 className="text-lg font-medium">No saved jobs</h3>
              <p className="text-gray-500 mt-1 mb-6">
                {activeFilters.length > 0
                  ? "No saved jobs match your filters. Try adjusting your search criteria."
                  : "You haven't saved any jobs yet. Browse jobs and click the bookmark icon to save them for later."}
              </p>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => (window.location.href = "/dashboard/map-jobs")}
              >
                Browse Jobs
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
