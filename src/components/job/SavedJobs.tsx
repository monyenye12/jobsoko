import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { Search, Filter, BookmarkX, Briefcase } from "lucide-react";
import JobCard from "./JobCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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

  useEffect(() => {
    if (user) {
      fetchSavedJobs();
    }
  }, [user]);

  const fetchSavedJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select(
          `
          id,
          job_id,
          user_id,
          created_at,
          job:job_id(id, title, company, location, salary, type, skills, urgent, created_at)
        `,
        )
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedJobs(data || []);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    } finally {
      setLoading(false);
    }
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

  const filteredJobs = searchTerm
    ? savedJobs.filter(
        (savedJob) =>
          savedJob.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          savedJob.job.company
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          savedJob.job.location
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          savedJob.job.skills?.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
    : savedJobs;

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
              <Button variant="outline" className="whitespace-nowrap">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredJobs.length > 0 ? (
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
                    company={savedJob.job.company}
                    location={savedJob.job.location}
                    salary={savedJob.job.salary}
                    type={savedJob.job.type}
                    posted={`Saved on ${new Date(savedJob.created_at).toLocaleDateString()}`}
                    skills={savedJob.job.skills}
                    urgent={savedJob.job.urgent}
                    saved={true}
                  />
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
                You haven't saved any jobs yet. Browse jobs and click the
                bookmark icon to save them for later.
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                Browse Jobs
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
