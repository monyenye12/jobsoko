import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "lucide-react";

interface ApplyJobFormProps {
  jobId: string;
  jobTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ApplyJobForm({
  jobId,
  jobTitle,
  onSuccess,
  onCancel,
}: ApplyJobFormProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      const fileType = file.type;
      if (
        ![
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(fileType)
      ) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        });
        return;
      }

      setResumeFile(file);
      toast({
        title: "File selected",
        description: `${file.name} selected for upload`,
        variant: "success",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to apply for jobs",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      // Check if user has already applied for this job
      const { data: existingApplication, error: checkError } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", jobId)
        .eq("applicant_id", user.id)
        .single();

      if (existingApplication) {
        toast({
          title: "Already applied",
          description: "You have already applied for this job",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      let resumeUrl = userProfile?.resume_url || "";

      // Upload resume if provided
      if (resumeFile) {
        setUploadProgress(10);
        const fileExt = resumeFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `resumes/${fileName}`;

        try {
          setUploadProgress(30);
          const { error: uploadError, data } = await supabase.storage
            .from("resumes")
            .upload(filePath, resumeFile, {
              cacheControl: "3600",
              upsert: true, // Use upsert to overwrite if file exists
            });

          if (uploadError) {
            throw uploadError;
          }

          setUploadProgress(70);
          // Get the public URL
          const { data: urlData } = supabase.storage
            .from("resumes")
            .getPublicUrl(filePath);

          resumeUrl = urlData.publicUrl;
          setUploadProgress(90);

          // Update user profile with resume URL
          await supabase
            .from("users")
            .update({ resume_url: resumeUrl })
            .eq("id", user.id);

          setUploadProgress(100);

          console.log("Resume uploaded successfully:", resumeUrl);
        } catch (error) {
          console.error("Error uploading resume:", error);
          toast({
            title: "Upload failed",
            description: "Failed to upload resume. Please try again.",
            variant: "destructive",
          });
          throw error;
        }
      }

      // Create application
      const { error: applicationError } = await supabase
        .from("applications")
        .insert([
          {
            job_id: jobId,
            applicant_id: user.id,
            status: "pending",
            cover_letter: coverLetter,
            resume_url: resumeUrl,
            created_at: new Date().toISOString(),
          },
        ]);

      if (applicationError) throw applicationError;

      // Get job details to create notification
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("employer_id, title")
        .eq("id", jobId)
        .single();

      if (!jobError && jobData) {
        // Create notification for employer
        await supabase.from("notifications").insert([
          {
            user_id: jobData.employer_id,
            title: "New Job Application",
            message: `${userProfile?.fullName || "Someone"} applied for ${jobData.title}`,
            type: "application",
            read: false,
            created_at: new Date().toISOString(),
          },
        ]);
      }

      toast({
        title: "Application submitted",
        description: `You have successfully applied for ${jobTitle}`,
        variant: "success",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error applying for job:", error);
      toast({
        title: "Application failed",
        description:
          "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="job">Job</Label>
        <Input id="job" value={jobTitle} disabled className="bg-gray-50" />
      </div>

      <div>
        <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
        <Textarea
          id="coverLetter"
          placeholder="Tell the employer why you're a good fit for this position..."
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          className="min-h-[120px]"
        />
      </div>

      <div>
        <Label htmlFor="resume">
          Resume/CV{" "}
          {userProfile?.resume_url ? "(You already have a resume on file)" : ""}
        </Label>
        <div className="mt-1">
          <label
            htmlFor="resume-upload"
            className="flex items-center justify-center w-full p-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400"
          >
            <div className="space-y-1 text-center">
              <FileUpload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="font-medium text-primary">
                  Click to upload a file
                </span>{" "}
                or drag and drop
              </div>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
            </div>
            <input
              id="resume-upload"
              name="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
        </div>
        {resumeFile && (
          <p className="mt-2 text-sm text-gray-600">
            Selected file: {resumeFile.name}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" /> Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </form>
  );
}
