import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Briefcase, Star, BookmarkIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface JobCardProps {
  title: string;
  company: string;
  location: string;
  distance?: string;
  salary?: string;
  type: string;
  posted: string;
  rating?: number;
  skills?: string[];
  urgent?: boolean;
  onClick?: () => void;
}

export default function JobCard({
  title = "Construction Worker",
  company = "ABC Construction",
  location = "Nairobi, Kenya",
  distance = "2 km away",
  salary = "KSh 800-1200/day",
  type = "Full-time",
  posted = "Posted 2 days ago",
  rating = 4.5,
  skills = ["Manual Labor", "Construction"],
  urgent = false,
  onClick = () => {
    window.location.href = "/dashboard";
  },
}: JobCardProps) {
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
    toast({
      title: saved ? "Job removed from saved jobs" : "Job saved successfully",
      description: saved
        ? "The job has been removed from your saved jobs."
        : "You can view this job later in your saved jobs.",
    });
  };

  return (
    <Card className="w-full overflow-hidden hover:shadow-md transition-shadow bg-white relative">
      <Button
        variant="ghost"
        size="sm"
        className={`absolute top-2 right-2 h-8 w-8 p-0 z-10 ${saved ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}`}
        onClick={handleSave}
      >
        <BookmarkIcon
          className="h-4 w-4"
          fill={saved ? "currentColor" : "none"}
        />
      </Button>

      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-gray-600 text-sm">{company}</p>
        </div>
        {urgent && (
          <Badge variant="destructive" className="font-medium">
            Urgent
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{location}</span>
            {distance && (
              <Badge variant="outline" className="ml-2 text-xs font-normal">
                {distance}
              </Badge>
            )}
          </div>

          <div className="flex items-center text-gray-600">
            <Briefcase className="h-4 w-4 mr-2" />
            <span>{type}</span>
          </div>

          {salary && <div className="font-medium text-green-600">{salary}</div>}

          {skills && skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center border-t mt-2">
        <div className="flex items-center text-gray-500 text-xs">
          <Clock className="h-3 w-3 mr-1" />
          <span>{posted}</span>
        </div>

        {rating && (
          <div className="flex items-center text-amber-500">
            <Star className="h-4 w-4 fill-amber-500 mr-1" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        )}

        <Button
          size="sm"
          className="ml-auto bg-green-600 hover:bg-green-700"
          onClick={onClick}
        >
          Apply
        </Button>
      </CardFooter>
    </Card>
  );
}
