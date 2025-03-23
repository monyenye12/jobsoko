import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Download, Upload, FileText, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResumeViewer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchResumeUrl();
    }
  }, [user]);

  const fetchResumeUrl = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("resume_url")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setResumeUrl(data?.resume_url || null);
    } catch (error) {
      console.error("Error fetching resume URL:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Resume upload triggered");
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is PDF
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileName = `${user?.id}-resume-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("resumes").getPublicUrl(fileName);
      const newResumeUrl = data.publicUrl;

      // Update user profile with resume URL
      const { error: updateError } = await supabase
        .from("users")
        .update({ resume_url: newResumeUrl })
        .eq("id", user?.id);

      if (updateError) throw updateError;

      setResumeUrl(newResumeUrl);
      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading resume:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload resume",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadResume = () => {
    if (resumeUrl) {
      window.open(resumeUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <FileText className="mr-2 h-6 w-6 text-green-600" />
            My Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          {resumeUrl ? (
            <div className="space-y-6">
              <div className="aspect-[8.5/11] w-full border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <iframe
                  src={`${resumeUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-full"
                  title="Resume Preview"
                ></iframe>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Button
                  onClick={downloadResume}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Resume
                </Button>

                <div>
                  <Input
                    id="resume-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                  <Label
                    htmlFor="resume-upload"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2 cursor-pointer"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload New Resume"}
                  </Label>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-6">
              <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No Resume Uploaded</h3>
                <p className="text-gray-500 mt-1 mb-6">
                  Upload your resume in PDF format to showcase your skills and
                  experience to potential employers.
                </p>

                <Input
                  id="resume-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
                <Label
                  htmlFor="resume-upload"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2 cursor-pointer"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload Resume (PDF)"}
                </Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
