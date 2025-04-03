import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle,
  X,
  MessageSquare,
  Star,
  MapPin,
  Briefcase,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type MatchingParams = {
  jobId: string;
  requiredSkills?: string[];
  jobLocation?: string;
  jobCategory?: string;
  experienceLevel?: string;
  limit?: number;
};

export const useCandidateMatching = ({
  jobId,
  requiredSkills = [],
  jobLocation = "",
  jobCategory = "",
  experienceLevel = "",
  limit = 10,
}: MatchingParams) => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    fetchCandidates();
  }, [jobId, requiredSkills, jobLocation, jobCategory, experienceLevel]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would query the users table for job seekers
      // with matching skills, location, etc.
      // For now, we'll use mock data

      // Mock data for candidates
      const mockCandidates = [
        {
          id: "1",
          fullName: "John Kamau",
          email: "john@example.com",
          phone: "0712345678",
          location: "Westlands, Nairobi",
          skills: ["Construction", "Carpentry", "Painting"],
          preferredCategory: "construction",
          rating: 4.8,
          verified: true,
          experience: "3 years",
          availability: "Immediate",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        },
        {
          id: "2",
          fullName: "Mary Wanjiku",
          email: "mary@example.com",
          phone: "0723456789",
          location: "Kilimani, Nairobi",
          skills: ["Cleaning", "Cooking", "Childcare"],
          preferredCategory: "cleaning",
          rating: 4.5,
          verified: true,
          experience: "2 years",
          availability: "1 week notice",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mary",
        },
        {
          id: "3",
          fullName: "David Ochieng",
          email: "david@example.com",
          phone: "0734567890",
          location: "CBD, Nairobi",
          skills: ["Driving", "Delivery", "Customer Service"],
          preferredCategory: "driving",
          rating: 4.2,
          verified: true,
          experience: "5 years",
          availability: "Immediate",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
        },
        {
          id: "4",
          fullName: "Sarah Njeri",
          email: "sarah@example.com",
          phone: "0745678901",
          location: "Karen, Nairobi",
          skills: ["Retail", "Sales", "Customer Service"],
          preferredCategory: "retail",
          rating: 4.0,
          verified: false,
          experience: "1 year",
          availability: "2 weeks notice",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        },
        {
          id: "5",
          fullName: "Michael Mwangi",
          email: "michael@example.com",
          phone: "0756789012",
          location: "Lavington, Nairobi",
          skills: ["Security", "Surveillance", "Customer Service"],
          preferredCategory: "security",
          rating: 4.7,
          verified: true,
          experience: "7 years",
          availability: "Immediate",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
        },
      ];

      // Calculate match percentage for each candidate
      const candidatesWithMatchPercentage = mockCandidates.map((candidate) => {
        const matchPercentage = calculateMatchPercentage(candidate, {
          requiredSkills,
          jobLocation,
          jobCategory,
          experienceLevel,
        });

        return {
          ...candidate,
          matchPercentage,
        };
      });

      // Sort by match percentage (highest first)
      candidatesWithMatchPercentage.sort(
        (a, b) => b.matchPercentage - a.matchPercentage,
      );

      // Limit results
      setCandidates(candidatesWithMatchPercentage.slice(0, limit));
    } catch (err: any) {
      console.error("Error fetching candidate matches:", err);
      setError(err.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  // Calculate match percentage between a job and candidate
  const calculateMatchPercentage = (candidate: any, jobRequirements: any) => {
    let score = 0;
    let totalFactors = 0;

    // Skills match (highest weight)
    if (
      jobRequirements.requiredSkills &&
      jobRequirements.requiredSkills.length > 0 &&
      candidate.skills
    ) {
      totalFactors += 50;
      const matchingSkills = candidate.skills.filter((skill: string) =>
        jobRequirements.requiredSkills.some(
          (reqSkill: string) =>
            reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(reqSkill.toLowerCase()),
        ),
      );

      if (matchingSkills.length > 0) {
        score +=
          50 *
          (matchingSkills.length /
            Math.max(jobRequirements.requiredSkills.length, 1));
      }
    }

    // Location match
    if (jobRequirements.jobLocation && candidate.location) {
      totalFactors += 20;
      if (
        candidate.location
          .toLowerCase()
          .includes(jobRequirements.jobLocation.toLowerCase()) ||
        jobRequirements.jobLocation
          .toLowerCase()
          .includes(candidate.location.toLowerCase().split(",")[0])
      ) {
        score += 20;
      }
    }

    // Category match
    if (jobRequirements.jobCategory && candidate.preferredCategory) {
      totalFactors += 20;
      if (
        candidate.preferredCategory.toLowerCase() ===
        jobRequirements.jobCategory.toLowerCase()
      ) {
        score += 20;
      }
    }

    // Experience level match
    if (jobRequirements.experienceLevel && candidate.experience) {
      totalFactors += 10;
      // Simple string matching for experience
      if (
        candidate.experience
          .toLowerCase()
          .includes(jobRequirements.experienceLevel.toLowerCase())
      ) {
        score += 10;
      }
    }

    // Calculate final percentage (default to 50% if no factors)
    return totalFactors > 0 ? Math.round((score / totalFactors) * 100) : 50;
  };

  return { candidates, loading, error, refetch: fetchCandidates };
};

// Component to display candidate matches for a job
export default function CandidateMatchingEngine({
  jobId,
  jobTitle,
  requiredSkills = [],
}: {
  jobId: string;
  jobTitle: string;
  requiredSkills?: string[];
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invitedCandidates, setInvitedCandidates] = useState<string[]>([]);

  const { candidates, loading, error } = useCandidateMatching({
    jobId,
    requiredSkills,
    jobLocation: "Nairobi", // Example location
    jobCategory: "construction", // Example category
    limit: 10,
  });

  const sendInvite = async (candidateId: string, candidateName: string) => {
    try {
      // In a real implementation, this would create a record in a job_invitations table
      // For now, we'll just update the local state
      setInvitedCandidates((prev) => [...prev, candidateId]);

      toast({
        title: "Invitation Sent",
        description: `You've invited ${candidateName} to apply for ${jobTitle}`,
      });
    } catch (err) {
      console.error("Error sending invitation:", err);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return <div>Please log in to see candidate matches</div>;
  }

  if (loading) {
    return <div>Loading candidate matches...</div>;
  }

  if (error) {
    return <div>Error loading candidates: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Top Candidates for {jobTitle}</h2>
      <p className="text-sm text-gray-500">
        Showing candidates that match your job requirements
      </p>

      {candidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={candidate.avatar} />
                      <AvatarFallback>{candidate.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {candidate.fullName}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span>{candidate.rating}</span>
                        {candidate.verified && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-xs py-0 border-green-200 text-green-700"
                          >
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      candidate.matchPercentage >= 80
                        ? "bg-green-100 text-green-800"
                        : candidate.matchPercentage >= 60
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {candidate.matchPercentage}% Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span className="text-sm">{candidate.location}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span className="text-sm">
                      {candidate.experience} experience
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.map((skill: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" /> Message
                </Button>
                {invitedCandidates.includes(candidate.id) ? (
                  <Button size="sm" className="text-xs bg-green-600" disabled>
                    <CheckCircle className="h-3 w-3 mr-1" /> Invited
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="text-xs"
                    onClick={() => sendInvite(candidate.id, candidate.fullName)}
                  >
                    Invite to Apply
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p>No matching candidates found for this job.</p>
      )}
    </div>
  );
}

// Swipe interface for job matching (Tinder-like)
export function SwipeMatchInterface() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const { toast } = useToast();

  // Mock job data
  const jobs = [
    {
      id: "1",
      title: "Construction Worker",
      company: "ABC Construction",
      location: "Westlands, Nairobi",
      salary: "KSh 800-1200/day",
      description:
        "We are looking for experienced construction workers for a commercial building project in Westlands.",
      skills: ["Manual Labor", "Construction"],
      matchPercentage: 92,
    },
    {
      id: "2",
      title: "Delivery Driver",
      company: "Quick Deliveries Ltd",
      location: "Kilimani, Nairobi",
      salary: "KSh 500-700/day",
      description:
        "Looking for motorcycle delivery drivers to join our growing team. Must have own motorcycle and valid driving license.",
      skills: ["Driving", "Navigation"],
      matchPercentage: 85,
    },
    {
      id: "3",
      title: "Shop Assistant",
      company: "Retail Mart",
      location: "CBD, Nairobi",
      salary: "KSh 15,000/month",
      description:
        "Retail Mart is hiring shop assistants for our CBD branch. Responsibilities include customer service, stock arrangement, and sales.",
      skills: ["Customer Service", "Sales"],
      matchPercentage: 78,
    },
    {
      id: "4",
      title: "House Cleaner",
      company: "CleanHome Services",
      location: "Karen, Nairobi",
      salary: "KSh 1,000/day",
      description:
        "Seeking experienced house cleaners for regular cleaning assignments in Karen area. Must be thorough, reliable and have references.",
      skills: ["Cleaning", "Organization"],
      matchPercentage: 65,
    },
    {
      id: "5",
      title: "Security Guard",
      company: "SecureLife Ltd",
      location: "Lavington, Nairobi",
      salary: "KSh 18,000/month",
      description:
        "SecureLife is hiring security guards for residential properties in Lavington. 12-hour shifts, day and night positions available.",
      skills: ["Security", "Surveillance"],
      matchPercentage: 70,
    },
  ];

  const currentJob = jobs[currentIndex];

  const handleSwipe = (dir: "left" | "right") => {
    setDirection(dir);

    // After animation completes
    setTimeout(() => {
      if (dir === "right") {
        // User liked the job
        toast({
          title: "Job Saved",
          description: `You've saved ${currentJob.title} to your matches!`,
        });
      }

      // Move to next job
      if (currentIndex < jobs.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // End of jobs
        toast({
          title: "No More Jobs",
          description:
            "You've viewed all available jobs. Check back later for more!",
        });
      }

      setDirection(null);
    }, 300);
  };

  if (currentIndex >= jobs.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">No More Jobs</h2>
        <p className="text-gray-500 mb-4">
          You've viewed all available jobs. Check back later for more!
        </p>
        <Button onClick={() => setCurrentIndex(0)}>Start Over</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-xl font-semibold mb-6">Find Your Perfect Match</h2>

      <div className="relative w-full max-w-md">
        <div
          className={`transition-all duration-300 ${
            direction === "left"
              ? "-translate-x-full opacity-0"
              : direction === "right"
                ? "translate-x-full opacity-0"
                : ""
          }`}
        >
          <Card className="overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <Briefcase className="h-16 w-16 text-gray-400" />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{currentJob.title}</CardTitle>
                  <p className="text-sm text-gray-600">{currentJob.company}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {currentJob.matchPercentage}% Match
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{currentJob.location}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>{currentJob.salary}</span>
              </div>
              <p className="text-sm">{currentJob.description}</p>
              <div>
                <p className="text-sm font-medium mb-1">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {currentJob.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-red-300 text-red-500"
            onClick={() => handleSwipe("left")}
          >
            <X className="h-6 w-6" />
          </Button>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600"
            onClick={() => handleSwipe("right")}
          >
            <CheckCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Swipe right to save jobs you're interested in, or left to skip.
        </p>
      </div>
    </div>
  );
}
