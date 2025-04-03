import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  MapPin,
  Briefcase,
  Clock,
  Star,
  BookmarkIcon,
  ArrowLeft,
} from "lucide-react";
import ApplyJobForm from "./ApplyJobForm";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchJobDetails(id);
      if (user) {
        checkIfJobIsSaved(id);
      }
    }
  }, [id, user]);

  const fetchJobDetails = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIfJobIsSaved = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select("*")
        .eq("job_id", jobId)
        .eq("user_id", user?.id)
        .single();

      setIsSaved(!!data);
    } catch (error) {
      console.error("Error checking saved job:", error);
    }
  };

  const toggleSaveJob = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      if (isSaved) {
        // Remove from saved jobs
        const { error } = await supabase
          .from("saved_jobs")
          .delete()
          .eq("user_id", user.id)
          .eq("job_id", id);

        if (error) throw error;

        setIsSaved(false);
        toast({
          title: "Job removed",
          description: "Job removed from saved jobs",
        });
      } else {
        // Add to saved jobs
        const { error } = await supabase.from("saved_jobs").insert([
          {
            user_id: user.id,
            job_id: id,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        setIsSaved(true);
        toast({
          title: "Job saved",
          description: "Job added to saved jobs",
        });
      }
    } catch (error) {
      console.error("Error toggling saved job:", error);
      toast({
        title: "Error",
        description: "Failed to save/unsave job",
        variant: "destructive",
      });
    }
  };

  const handleApplySuccess = () => {
    setShowApplyForm(false);
    toast({
      title: "Application submitted",
      description:
        "Your application has been submitted successfully. You can track it in My Applications.",
      variant: "success",
    });

    // After 1.5 seconds, redirect to my applications page
    setTimeout(() => {
      navigate("/dashboard/my-applications");
    }, 1500);
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
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="ml-2 text-gray-600">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Job not found
          </h3>
          <p className="text-gray-500 mb-4">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
      </Button>

      <div className="bg-white rounded-lg shadow-md p-6">
        {showApplyForm ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Apply for {job.title}</h2>
            <ApplyJobForm
              jobId={job.id}
              jobTitle={job.title}
              onSuccess={handleApplySuccess}
              onCancel={() => setShowApplyForm(false)}
            />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <p className="text-gray-600">{job.company}</p>
              </div>
              <Button
                variant="ghost"
                className={`${isSaved ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}`}
                onClick={toggleSaveJob}
              >
                <BookmarkIcon
                  className="h-5 w-5 mr-1"
                  fill={isSaved ? "currentColor" : "none"}
                />
                {isSaved ? "Saved" : "Save"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span>{job.type}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Posted on {formatDate(job.created_at)}</span>
                </div>
              </div>

              <div className="space-y-2">
                {job.salary_min && (
                  <div className="font-medium text-green-600">
                    {job.salary_min && job.salary_max
                      ? `KSh ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                      : `KSh ${job.salary_min.toLocaleString()}`}
                    /{job.payment_frequency || "month"}
                  </div>
                )}
                {job.deadline && (
                  <div className="flex items-center text-red-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Apply before {formatDate(job.deadline)}</span>
                  </div>
                )}
                {job.urgent && (
                  <Badge variant="destructive" className="font-medium">
                    Urgent
                  </Badge>
                )}
              </div>
            </div>

            {job.skills && job.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Job Description</h3>
              <div className="text-gray-700 whitespace-pre-line">
                {job.description || "No description provided."}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Requirements</h3>
              <div className="text-gray-700 whitespace-pre-line">
                {job.requirements || "No specific requirements provided."}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Responsibilities</h3>
              <div className="text-gray-700 whitespace-pre-line">
                {job.responsibilities ||
                  "No specific responsibilities provided."}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowApplyForm(true)}
              >
                Apply Now
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
