import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  Star,
  Download,
  Calendar,
  Filter,
  Search,
  BarChart2,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  FileText,
} from "lucide-react";

type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  appliedFor: string;
  jobId: string;
  status: "pending" | "shortlisted" | "interview" | "hired" | "rejected";
  appliedDate: string;
  experience: "beginner" | "intermediate" | "expert";
  rating: number;
  skills: string[];
  resumeUrl?: string;
  avatar?: string;
  coverLetter?: string;
};

export default function CandidateManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [experienceFilter, setExperienceFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [messageText, setMessageText] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewLocation, setInterviewLocation] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");

  // Mock data for candidates
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+254 712 345 678",
      location: "Westlands, Nairobi",
      appliedFor: "Construction Worker",
      jobId: "job-1",
      status: "pending",
      appliedDate: "2023-12-01",
      experience: "intermediate",
      rating: 4.5,
      skills: ["Carpentry", "Masonry", "Painting"],
      resumeUrl: "/resumes/john-doe-resume.pdf",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      coverLetter:
        "I am writing to express my interest in the Construction Worker position. With over 5 years of experience in the construction industry, I have developed strong skills in carpentry, masonry, and painting.",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+254 723 456 789",
      location: "Kilimani, Nairobi",
      appliedFor: "Delivery Driver",
      jobId: "job-2",
      status: "shortlisted",
      appliedDate: "2023-12-03",
      experience: "expert",
      rating: 4.8,
      skills: ["Driving", "Navigation", "Customer Service"],
      resumeUrl: "/resumes/jane-smith-resume.pdf",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
    },
    {
      id: "3",
      name: "David Wilson",
      email: "david.wilson@example.com",
      phone: "+254 734 567 890",
      location: "Embakasi, Nairobi",
      appliedFor: "Security Guard",
      jobId: "job-3",
      status: "interview",
      appliedDate: "2023-12-05",
      experience: "beginner",
      rating: 3.9,
      skills: ["Security", "Surveillance", "First Aid"],
      resumeUrl: "/resumes/david-wilson-resume.pdf",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
    },
    {
      id: "4",
      name: "Mary Johnson",
      email: "mary.johnson@example.com",
      phone: "+254 745 678 901",
      location: "Karen, Nairobi",
      appliedFor: "House Cleaner",
      jobId: "job-4",
      status: "hired",
      appliedDate: "2023-12-02",
      experience: "expert",
      rating: 4.9,
      skills: ["Cleaning", "Organization", "Time Management"],
      resumeUrl: "/resumes/mary-johnson-resume.pdf",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mary",
    },
    {
      id: "5",
      name: "Robert Brown",
      email: "robert.brown@example.com",
      phone: "+254 756 789 012",
      location: "Langata, Nairobi",
      appliedFor: "Retail Assistant",
      jobId: "job-5",
      status: "rejected",
      appliedDate: "2023-12-04",
      experience: "beginner",
      rating: 3.2,
      skills: ["Customer Service", "Sales", "Inventory Management"],
      resumeUrl: "/resumes/robert-brown-resume.pdf",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert",
    },
  ]);

  const filteredCandidates = candidates.filter((candidate) => {
    // Search term filter
    const matchesSearch =
      searchTerm === "" ||
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.appliedFor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    // Status filter
    const matchesStatus =
      statusFilter === null || candidate.status === statusFilter;

    // Experience filter
    const matchesExperience =
      experienceFilter === null || candidate.experience === experienceFilter;

    return matchesSearch && matchesStatus && matchesExperience;
  });

  // Sort candidates
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating;
    } else if (sortBy === "date") {
      return (
        new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
      );
    } else if (sortBy === "experience") {
      const experienceOrder = { beginner: 1, intermediate: 2, expert: 3 };
      return experienceOrder[b.experience] - experienceOrder[a.experience];
    }
    return 0;
  });

  const updateCandidateStatus = async (
    candidateId: string,
    newStatus: "pending" | "shortlisted" | "interview" | "hired" | "rejected",
  ) => {
    // First update the UI for immediate feedback
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, status: newStatus }
          : candidate,
      ),
    );

    try {
      // Then update in the database
      const candidate = candidates.find((c) => c.id === candidateId);
      if (candidate) {
        // Update the application status in the database
        const { error } = await supabase
          .from("applications")
          .update({ status: newStatus })
          .eq("id", candidate.id);

        if (error) throw error;

        // Create a notification for the applicant
        await supabase.from("notifications").insert([
          {
            user_id: candidateId,
            title: "Application Status Updated",
            message: `Your application for ${candidate.appliedFor} has been ${newStatus}`,
            type: "application_update",
            read: false,
            created_at: new Date().toISOString(),
          },
        ]);
      }

      toast({
        title: "Status Updated",
        description: `Candidate status has been updated to ${newStatus}`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the application status",
        variant: "destructive",
      });
    }
  };

  const sendMessage = () => {
    if (!selectedCandidate || !messageText.trim()) return;

    toast({
      title: "Message Sent",
      description: `Your message has been sent to ${selectedCandidate.name}`,
    });

    setMessageText("");
  };

  const scheduleInterview = () => {
    if (
      !selectedCandidate ||
      !interviewDate ||
      !interviewTime ||
      !interviewLocation
    )
      return;

    toast({
      title: "Interview Scheduled",
      description: `Interview with ${selectedCandidate.name} has been scheduled for ${interviewDate} at ${interviewTime}`,
    });

    // Update candidate status to interview
    updateCandidateStatus(selectedCandidate.id, "interview");

    // Reset form
    setInterviewDate("");
    setInterviewTime("");
    setInterviewLocation("");
    setInterviewNotes("");
  };

  const downloadResume = (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    toast({
      title: "Resume Downloaded",
      description: `${candidate.name}'s resume has been downloaded`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "shortlisted":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Shortlisted
          </Badge>
        );
      case "interview":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Interview
          </Badge>
        );
      case "hired":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Hired
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getExperienceLabel = (experience: string) => {
    switch (experience) {
      case "beginner":
        return "Beginner (0-2 years)";
      case "intermediate":
        return "Intermediate (3-5 years)";
      case "expert":
        return "Expert (5+ years)";
      default:
        return experience;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-semibold">Candidate Management</h2>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={statusFilter || ""}
            onValueChange={(value) => setStatusFilter(value || null)}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={experienceFilter || ""}
            onValueChange={(value) => setExperienceFilter(value || null)}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Experience</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortBy || ""}
            onValueChange={(value) => setSortBy(value || null)}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Default</SelectItem>
              <SelectItem value="rating">Highest Rating</SelectItem>
              <SelectItem value="date">Newest First</SelectItem>
              <SelectItem value="experience">Experience Level</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sortedCandidates.length > 0 ? (
          sortedCandidates.map((candidate) => (
            <Card key={candidate.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={candidate.avatar} />
                        <AvatarFallback>{candidate.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-lg">
                          {candidate.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {candidate.appliedFor}
                        </p>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm">
                            {candidate.rating} Rating
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-600">
                            {getExperienceLabel(candidate.experience)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-end">
                      {getStatusBadge(candidate.status)}
                      <span className="text-xs text-gray-500 mt-1">
                        Applied on{" "}
                        {new Date(candidate.appliedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {candidate.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        <span>{candidate.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-1" />
                        <span>{candidate.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-1" />
                        <span>{candidate.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" /> Message
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Message to {selectedCandidate?.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea
                              placeholder="Type your message here..."
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              rows={5}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              onClick={sendMessage}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Send Message
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          <Calendar className="h-3 w-3 mr-1" /> Schedule
                          Interview
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Schedule Interview with {selectedCandidate?.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Date</Label>
                              <Input
                                type="date"
                                value={interviewDate}
                                onChange={(e) =>
                                  setInterviewDate(e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Time</Label>
                              <Input
                                type="time"
                                value={interviewTime}
                                onChange={(e) =>
                                  setInterviewTime(e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Location</Label>
                            <Input
                              placeholder="Interview location"
                              value={interviewLocation}
                              onChange={(e) =>
                                setInterviewLocation(e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                              placeholder="Additional notes..."
                              value={interviewNotes}
                              onChange={(e) =>
                                setInterviewNotes(e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              onClick={scheduleInterview}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Schedule
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                      onClick={() =>
                        updateCandidateStatus(candidate.id, "hired")
                      }
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Hire
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                      onClick={() =>
                        updateCandidateStatus(candidate.id, "rejected")
                      }
                    >
                      <XCircle className="h-3 w-3 mr-1" /> Reject
                    </Button>

                    {candidate.resumeUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => downloadResume(candidate.id)}
                      >
                        <Download className="h-3 w-3 mr-1" /> Resume
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No candidates match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
