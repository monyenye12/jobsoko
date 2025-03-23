import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Filter,
  Briefcase,
  Clock,
  Calendar,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import JobCard from "./JobCard";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function MapJobView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applicationNote, setApplicationNote] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock data for demonstration
  const jobs = [
    {
      id: 1,
      title: "Construction Worker",
      company: "ABC Construction",
      location: "Westlands, Nairobi",
      distance: "2 km away",
      salary: "KSh 800-1200/day",
      type: "Full-time",
      posted: "Posted 2 days ago",
      rating: 4.5,
      skills: ["Manual Labor", "Construction"],
      urgent: true,
      description:
        "We are looking for experienced construction workers for a commercial building project in Westlands. Must have at least 2 years of experience in construction work. Daily wages with possibility of long-term employment.",
      requirements: [
        "2+ years experience",
        "Own basic tools",
        "Ability to work in a team",
        "Available immediately",
      ],
      contactPerson: "John Kamau",
      contactPhone: "+254 712 345 678",
      coordinates: { lat: -1.2635, lng: 36.8219 },
    },
    {
      id: 2,
      title: "Delivery Driver",
      company: "Quick Deliveries Ltd",
      location: "Kilimani, Nairobi",
      distance: "3.5 km away",
      salary: "KSh 500-700/day",
      type: "Part-time",
      posted: "Posted 1 day ago",
      rating: 4.2,
      skills: ["Driving", "Navigation"],
      urgent: false,
      description:
        "Looking for motorcycle delivery drivers to join our growing team. Must have own motorcycle and valid driving license. Flexible hours and competitive pay per delivery.",
      requirements: [
        "Valid driving license",
        "Own motorcycle",
        "Smartphone with data plan",
        "Knowledge of Nairobi roads",
      ],
      contactPerson: "Sarah Wanjiku",
      contactPhone: "+254 723 456 789",
      coordinates: { lat: -1.2873, lng: 36.7822 },
    },
    {
      id: 3,
      title: "Shop Assistant",
      company: "Retail Mart",
      location: "CBD, Nairobi",
      distance: "1 km away",
      salary: "KSh 15,000/month",
      type: "Full-time",
      posted: "Posted 3 days ago",
      rating: 3.8,
      skills: ["Customer Service", "Sales"],
      urgent: false,
      description:
        "Retail Mart is hiring shop assistants for our CBD branch. Responsibilities include customer service, stock arrangement, and sales. Previous retail experience is a plus but not required.",
      requirements: [
        "Good communication skills",
        "Basic math skills",
        "Ability to stand for long hours",
        "Customer-oriented attitude",
      ],
      contactPerson: "David Ochieng",
      contactPhone: "+254 734 567 890",
      coordinates: { lat: -1.2921, lng: 36.8219 },
    },
    {
      id: 4,
      title: "House Cleaner",
      company: "CleanHome Services",
      location: "Karen, Nairobi",
      distance: "5.2 km away",
      salary: "KSh 1,000/day",
      type: "Part-time",
      posted: "Posted 4 days ago",
      rating: 4.7,
      skills: ["Cleaning", "Organization"],
      urgent: true,
      description:
        "Seeking experienced house cleaners for regular cleaning assignments in Karen area. Must be thorough, reliable and have references.",
      requirements: [
        "Previous cleaning experience",
        "References",
        "Attention to detail",
        "Reliable transportation",
      ],
      contactPerson: "Mary Njeri",
      contactPhone: "+254 745 678 901",
      coordinates: { lat: -1.3152, lng: 36.7116 },
    },
    {
      id: 5,
      title: "Security Guard",
      company: "SecureLife Ltd",
      location: "Lavington, Nairobi",
      distance: "4.1 km away",
      salary: "KSh 18,000/month",
      type: "Full-time",
      posted: "Posted 2 days ago",
      rating: 4.0,
      skills: ["Security", "Surveillance"],
      urgent: false,
      description:
        "SecureLife is hiring security guards for residential properties in Lavington. 12-hour shifts, day and night positions available.",
      requirements: [
        "Security training certificate",
        "Clean record",
        "Minimum height 5'7\"",
        "Good physical condition",
      ],
      contactPerson: "Robert Maina",
      contactPhone: "+254 756 789 012",
      coordinates: { lat: -1.2762, lng: 36.7667 },
    },
  ];

  const handleApply = (job: any) => {
    setSelectedJob(job);
  };

  const submitApplication = () => {
    toast({
      title: "Application Submitted",
      description: `Your application for ${selectedJob.title} at ${selectedJob.company} has been submitted successfully.`,
    });
    setShowSuccess(true);
    setApplicationNote("");
  };

  const filteredJobs = searchTerm
    ? jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.skills.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
    : jobs;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-gray-50">
      {/* Map Section (Placeholder) */}
      <div className="w-full md:w-2/3 h-[300px] md:h-full bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="text-gray-500 mt-2">Map View Coming Soon</p>
            <p className="text-gray-400 text-sm">
              Jobs will be displayed here on the map
            </p>
          </div>
        </div>

        {/* Search overlay */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                className="pl-9 pr-4 py-2 w-full bg-white shadow-sm rounded-lg"
                placeholder="Search jobs, skills, or location"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="bg-white">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Job markers (would be dynamic in a real implementation) */}
        <div className="absolute left-[30%] top-[40%] transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <MapPin className="h-8 w-8 text-red-500" />
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-md text-xs whitespace-nowrap">
              Construction Worker
            </div>
          </div>
        </div>
        <div className="absolute left-[60%] top-[60%] transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <MapPin className="h-8 w-8 text-blue-500" />
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-md text-xs whitespace-nowrap">
              Delivery Driver
            </div>
          </div>
        </div>
        <div className="absolute left-[45%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <MapPin className="h-8 w-8 text-green-500" />
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-md text-xs whitespace-nowrap">
              Shop Assistant
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="w-full md:w-1/3 h-full overflow-y-auto p-4 bg-white border-l">
        <h2 className="text-xl font-semibold mb-4">Jobs Near You</h2>
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              title={job.title}
              company={job.company}
              location={job.location}
              distance={job.distance}
              salary={job.salary}
              type={job.type}
              posted={job.posted}
              rating={job.rating}
              skills={job.skills}
              urgent={job.urgent}
              onClick={() => handleApply(job)}
            />
          ))}
        </div>
      </div>

      {/* Job Application Dialog */}
      <Dialog
        open={!!selectedJob && !showSuccess}
        onOpenChange={() => {
          setSelectedJob(null);
          setShowSuccess(false);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg">{selectedJob?.title}</h3>
                <p className="text-sm text-gray-600">{selectedJob?.company}</p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{selectedJob?.location}</span>
                  <span className="mx-2">•</span>
                  <span>{selectedJob?.distance}</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-sm">
                    <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{selectedJob?.type}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{selectedJob?.salary}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{selectedJob?.posted}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Job Description</h4>
                <p className="text-sm text-gray-700">
                  {selectedJob?.description}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Requirements</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {selectedJob?.requirements.map(
                    (req: string, index: number) => <li key={index}>{req}</li>,
                  )}
                </ul>
              </div>

              <div>
                <Label htmlFor="note" className="font-medium">
                  Add a note to your application (optional)
                </Label>
                <Textarea
                  id="note"
                  placeholder="Tell the employer why you're a good fit for this position..."
                  value={applicationNote}
                  onChange={(e) => setApplicationNote(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={submitApplication}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={showSuccess}
        onOpenChange={() => {
          setSelectedJob(null);
          setShowSuccess(false);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">
              Application Submitted!
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Your application for {selectedJob?.title} at{" "}
              {selectedJob?.company} has been submitted successfully. The
              employer will contact you soon.
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedJob(null);
                  setShowSuccess(false);
                }}
              >
                Find More Jobs
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => navigate("/dashboard")}
              >
                View My Applications
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
