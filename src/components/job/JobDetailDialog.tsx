import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Clock, Star, BookmarkIcon } from "lucide-react";
import ApplyJobForm from "./ApplyJobForm";

interface JobDetailDialogProps {
  job: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplySuccess: () => void;
  isSaved: boolean;
  onSave: () => void;
}

export default function JobDetailDialog({
  job,
  open,
  onOpenChange,
  onApplySuccess,
  isSaved,
  onSave,
}: JobDetailDialogProps) {
  const [showApplyForm, setShowApplyForm] = React.useState(false);

  if (!job) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{job.title}</DialogTitle>
          <DialogDescription className="text-base font-medium text-gray-700">
            {job.company}
          </DialogDescription>
        </DialogHeader>

        {showApplyForm ? (
          <ApplyJobForm
            jobId={job.id}
            jobTitle={job.title}
            onSuccess={onApplySuccess}
            onCancel={() => setShowApplyForm(false)}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
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
                {job.deadline && (
                  <div className="flex items-center text-red-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Apply before {formatDate(job.deadline)}</span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isSaved ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}`}
                onClick={onSave}
              >
                <BookmarkIcon
                  className="h-4 w-4"
                  fill={isSaved ? "currentColor" : "none"}
                />
              </Button>
            </div>

            {job.salary_min && (
              <div className="font-medium text-green-600">
                {job.salary_min && job.salary_max
                  ? `KSh ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                  : `KSh ${job.salary_min.toLocaleString()}`}
                /{job.payment_frequency || "month"}
              </div>
            )}

            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {job.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Job Description</h3>
              <div className="text-gray-700 whitespace-pre-line">
                {job.description || "No description provided."}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Requirements</h3>
              <div className="text-gray-700 whitespace-pre-line">
                {job.requirements || "No specific requirements provided."}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Responsibilities</h3>
              <div className="text-gray-700 whitespace-pre-line">
                {job.responsibilities ||
                  "No specific responsibilities provided."}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowApplyForm(true)}
              >
                Apply Now
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
