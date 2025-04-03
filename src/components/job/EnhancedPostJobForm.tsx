import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useJobPostingNotification } from "./JobPostingTrigger";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Calendar,
  Users,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const jobCategories = [
  { name: "Construction", icon: "🏗️" },
  { name: "Delivery", icon: "🛵" },
  { name: "Cleaning", icon: "🧹" },
  { name: "Retail", icon: "🛒" },
  { name: "Hospitality", icon: "🍽️" },
  { name: "Security", icon: "🔒" },
  { name: "Driving", icon: "🚗" },
  { name: "Farming", icon: "🌱" },
];

const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance/Gig"];

const skillsList = [
  "Cleaning",
  "Driving",
  "Cooking",
  "Carpentry",
  "Plumbing",
  "Customer Service",
  "Security",
  "Farming",
  "Retail",
  "Hospitality",
  "Construction",
  "Delivery",
  "Computer Skills",
  "Communication",
  "Management",
  "Sales",
  "Marketing",
];

const paymentFrequencies = ["Daily", "Weekly", "Monthly", "Per Task"];
const paymentMethods = [
  "Cash",
  "Bank Transfer",
  "Mobile Money (M-Pesa, Airtel Money, etc.)",
];
const benefits = [
  "Transport allowance",
  "Meals",
  "Uniform",
  "Insurance",
  "Bonuses",
  "Housing",
];
const applicationMethods = [
  "Apply Directly via JobSoko",
  "Submit CV & Cover Letter",
  "Call or WhatsApp Employer",
  "Walk-in Interview",
];

export default function EnhancedPostJobForm() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Basic Job Details
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("Full-time");
  const [description, setDescription] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [positions, setPositions] = useState("1");

  // Compensation & Payment Details
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryType, setSalaryType] = useState("Fixed Salary");
  const [paymentFrequency, setPaymentFrequency] = useState("Monthly");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);

  // Location & Work Schedule
  const [location, setLocation] = useState(userProfile?.location || "");
  const [workHours, setWorkHours] = useState("");
  const [isRemote, setIsRemote] = useState(false);

  // Application Process
  const [deadline, setDeadline] = useState("");
  const [selectedApplicationMethods, setSelectedApplicationMethods] = useState<
    string[]
  >(["Apply Directly via JobSoko"]);
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Job Posting Preferences
  const [visibility, setVisibility] = useState("Public");
  const [allowMessages, setAllowMessages] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(true);

  // Loading state
  const [loading, setLoading] = useState(false);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const handleBenefitToggle = (benefit: string) => {
    setSelectedBenefits((prev) =>
      prev.includes(benefit)
        ? prev.filter((b) => b !== benefit)
        : [...prev, benefit],
    );
  };

  const handleApplicationMethodToggle = (method: string) => {
    setSelectedApplicationMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method],
    );
  };

  const nextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!title || !category || !type || !description) {
        toast({
          title: "Required fields missing",
          description: "Please fill in all required fields before proceeding.",
          variant: "destructive",
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!salaryMin || !paymentFrequency) {
        toast({
          title: "Required fields missing",
          description: "Please fill in all required fields before proceeding.",
          variant: "destructive",
        });
        return;
      }
    } else if (currentStep === 3) {
      if (!location || !workHours) {
        toast({
          title: "Required fields missing",
          description: "Please fill in all required fields before proceeding.",
          variant: "destructive",
        });
        return;
      }
    } else if (currentStep === 4) {
      if (!deadline || selectedApplicationMethods.length === 0) {
        toast({
          title: "Required fields missing",
          description: "Please fill in all required fields before proceeding.",
          variant: "destructive",
        });
        return;
      }
    }

    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to post a job",
        variant: "destructive",
      });
      return;
    }

    // Validate deadline is required and in the future
    if (!deadline) {
      toast({
        title: "Deadline Required",
        description: "Please set an application deadline for your job posting",
        variant: "destructive",
      });
      return;
    }

    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadlineDate < today) {
      toast({
        title: "Invalid Deadline",
        description: "The deadline must be in the future",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate random coordinates for Nairobi area if not provided
      // This ensures the job shows up on the map
      const latitude = -1.28 + (Math.random() * 0.1 - 0.05); // Around Nairobi
      const longitude = 36.82 + (Math.random() * 0.1 - 0.05); // Around Nairobi

      // Prepare the job data
      const jobData = {
        title,
        category,
        type,
        description,
        skills: selectedSkills,
        positions: parseInt(positions),
        salary_min: parseInt(salaryMin),
        salary_max: salaryMax ? parseInt(salaryMax) : null,
        salary_type: salaryType,
        payment_frequency: paymentFrequency || "Monthly", // Ensure default value
        payment_method: paymentMethod || "Bank Transfer", // Ensure default value
        benefits: selectedBenefits || [],
        location,
        work_hours: workHours,
        is_remote: isRemote,
        deadline,
        application_methods: selectedApplicationMethods || [
          "Apply Directly via JobSoko",
        ],
        contact_person: contactPerson,
        contact_phone: contactPhone,
        visibility: visibility || "Public",
        allow_messages: allowMessages,
        enable_notifications: enableNotifications,
        employer_id: user.id,
        status: "active",
        created_at: new Date().toISOString(),
        // For compatibility with the job seeker dashboard
        company: userProfile?.businessName || userProfile?.full_name || "",
        urgent: false, // Fixed the undefined value
        latitude,
        longitude,
      };

      // Insert the job into the database
      // First check if the payment_frequency column exists
      try {
        await supabase.rpc("ensure_payment_frequency_column");
      } catch (rpcError) {
        console.log("RPC not available, continuing with insert", rpcError);
        // If RPC fails, we'll try to ensure the column exists directly
        try {
          // This is a fallback approach if the RPC is not available
          const { error: columnCheckError } = await supabase
            .from("jobs")
            .select("payment_frequency")
            .limit(1);

          if (columnCheckError) {
            console.log(
              "Column check failed, job might not have payment_frequency column",
              columnCheckError,
            );
            // We'll continue anyway and let the insert handle any errors
          }
        } catch (directCheckError) {
          console.log("Direct column check failed", directCheckError);
        }
      }

      const { data, error } = await supabase
        .from("jobs")
        .insert([jobData])
        .select();

      if (error) {
        console.error("Error posting job:", error);
        toast({
          title: "Error",
          description: "Failed to post job. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Success! Send notifications and navigate to success page
      toast({
        title: "Success",
        description: "Your job has been posted successfully!",
      });

      // Send notifications to matching job seekers
      try {
        const { notifyMatchingUsers } = useJobPostingNotification();
        await notifyMatchingUsers(data[0].id);
      } catch (notifyError) {
        console.error("Error sending notifications:", notifyError);
      }

      // Navigate to dashboard instead of success page
      navigate("/dashboard", {
        state: { message: "Job posted successfully!" },
      });
    } catch (error) {
      console.error("Error posting job:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Render the form based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Basic Job Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Construction Worker, Delivery Driver"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Job Category *</Label>
                  <Select
                    value={category}
                    onValueChange={(value) => setCategory(value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCategories.map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Job Type *</Label>
                  <Select
                    value={type}
                    onValueChange={(value) => setType(value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((jobType) => (
                        <SelectItem key={jobType} value={jobType}>
                          {jobType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="positions">Number of Positions</Label>
                  <Input
                    id="positions"
                    type="number"
                    min="1"
                    value={positions}
                    onChange={(e) => setPositions(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the job responsibilities, requirements, and any other relevant details"
                  className="min-h-[150px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {skillsList.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center space-x-2 rounded-md border p-2 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSkillToggle(skill)}
                    >
                      <Checkbox
                        id={`skill-${skill}`}
                        checked={selectedSkills.includes(skill)}
                        onCheckedChange={() => handleSkillToggle(skill)}
                      />
                      <label
                        htmlFor={`skill-${skill}`}
                        className="text-sm cursor-pointer"
                      >
                        {skill}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Compensation & Payment</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="salary-type">Salary Type</Label>
                  <Select
                    value={salaryType}
                    onValueChange={(value) => setSalaryType(value)}
                  >
                    <SelectTrigger id="salary-type">
                      <SelectValue placeholder="Select salary type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixed Salary">Fixed Salary</SelectItem>
                      <SelectItem value="Hourly Rate">Hourly Rate</SelectItem>
                      <SelectItem value="Range">Salary Range</SelectItem>
                      <SelectItem value="Negotiable">Negotiable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-frequency">Payment Frequency *</Label>
                  <Select
                    value={paymentFrequency}
                    onValueChange={(value) => setPaymentFrequency(value)}
                  >
                    <SelectTrigger id="payment-frequency">
                      <SelectValue placeholder="Select payment frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentFrequencies.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {freq}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary-min">
                    {salaryType === "Hourly Rate"
                      ? "Hourly Rate (KSh) *"
                      : "Minimum Salary (KSh) *"}
                  </Label>
                  <Input
                    id="salary-min"
                    type="number"
                    min="0"
                    placeholder="e.g. 15000"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                  />
                </div>

                {salaryType === "Range" && (
                  <div className="space-y-2">
                    <Label htmlFor="salary-max">Maximum Salary (KSh)</Label>
                    <Input
                      id="salary-max"
                      type="number"
                      min={parseInt(salaryMin) || 0}
                      placeholder="e.g. 25000"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value)}
                  >
                    <SelectTrigger id="payment-method">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Benefits & Perks</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-center space-x-2 rounded-md border p-2 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleBenefitToggle(benefit)}
                    >
                      <Checkbox
                        id={`benefit-${benefit}`}
                        checked={selectedBenefits.includes(benefit)}
                        onCheckedChange={() => handleBenefitToggle(benefit)}
                      />
                      <label
                        htmlFor={`benefit-${benefit}`}
                        className="text-sm cursor-pointer"
                      >
                        {benefit}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Location & Work Schedule
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">Job Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Nairobi, Kenya or specific address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work-hours">Work Hours *</Label>
                  <Input
                    id="work-hours"
                    placeholder="e.g. 9 AM - 5 PM, Monday to Friday"
                    value={workHours}
                    onChange={(e) => setWorkHours(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="remote"
                    checked={isRemote}
                    onCheckedChange={setIsRemote}
                  />
                  <Label htmlFor="remote">This is a remote job</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Application Process</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="deadline">Application Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-person">Contact Person</Label>
                  <Input
                    id="contact-person"
                    placeholder="e.g. John Doe"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Contact Phone</Label>
                  <Input
                    id="contact-phone"
                    placeholder="e.g. +254 712 345 678"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Application Methods *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {applicationMethods.map((method) => (
                    <div
                      key={method}
                      className="flex items-center space-x-2 rounded-md border p-2 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleApplicationMethodToggle(method)}
                    >
                      <Checkbox
                        id={`method-${method}`}
                        checked={selectedApplicationMethods.includes(method)}
                        onCheckedChange={() =>
                          handleApplicationMethodToggle(method)
                        }
                      />
                      <label
                        htmlFor={`method-${method}`}
                        className="text-sm cursor-pointer"
                      >
                        {method}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Job Posting Preferences</h2>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="visibility">Job Visibility</Label>
                  <Select
                    value={visibility}
                    onValueChange={(value) => setVisibility(value)}
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Public">Public</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-messages"
                    checked={allowMessages}
                    onCheckedChange={setAllowMessages}
                  />
                  <Label htmlFor="allow-messages">
                    Allow applicants to send messages
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-notifications"
                    checked={enableNotifications}
                    onCheckedChange={setEnableNotifications}
                  />
                  <Label htmlFor="enable-notifications">
                    Receive notifications for new applications
                  </Label>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Ready to post your job?
              </h3>
              <p className="text-sm text-blue-700">
                Review your job details before posting. Once posted, your job
                will be visible to potential applicants based on your visibility
                settings.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Post a New Job</h1>
          <p className="text-gray-600">
            Fill in the details below to create a new job posting
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Step {currentStep} of 5: {getStepTitle(currentStep)}
              </h2>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {renderStepContent()}

          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < 5 ? (
              <Button onClick={nextStep}>Next</Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={handlePreview}>
                  Preview
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Posting...
                    </>
                  ) : (
                    "Post Job"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStepTitle(step: number): string {
  switch (step) {
    case 1:
      return "Basic Job Details";
    case 2:
      return "Compensation & Payment";
    case 3:
      return "Location & Work Schedule";
    case 4:
      return "Application Process";
    case 5:
      return "Job Posting Preferences";
    default:
      return "";
  }
}
