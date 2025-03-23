import { useState } from "react";
import { Button } from "@/components/ui/button";
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

    setLoading(true);

    try {
      const { data, error } = await supabase.from("jobs").insert([
        {
          title,
          category,
          type,
          description,
          skills: selectedSkills,
          positions: parseInt(positions),
          salary_min: parseInt(salaryMin),
          salary_max: salaryMax ? parseInt(salaryMax) : null,
          salary_type: salaryType,
          payment_frequency: paymentFrequency,
          payment_method: paymentMethod,
          benefits: selectedBenefits,
          location,
          work_hours: workHours,
          is_remote: isRemote,
          deadline,
          application_methods: selectedApplicationMethods,
          contact_person: contactPerson,
          contact_phone: contactPhone,
          visibility,
          allow_messages: allowMessages,
          enable_notifications: enableNotifications,
          employer_id: user.id,
          status: "active",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job posted successfully",
      });

      // Show payment options
      setShowPayment(true);
    } catch (error) {
      console.error("Error posting job:", error);
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handlePaymentComplete = (plan: string) => {
    toast({
      title: "Payment Successful",
      description: `Your job has been posted with the ${plan} plan.`,
    });
    navigate("/dashboard");
  };

  if (showPayment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Choose Your Plan
            </CardTitle>
            <CardDescription>
              Select a plan to boost your job posting visibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl">Free Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold mb-6">
                    KSh 0{" "}
                    <span className="text-sm font-normal text-gray-500">
                      /job post
                    </span>
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>Standard visibility</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>Basic applicant filtering</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>Up to 3 job posts per month</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handlePaymentComplete("Free")}
                    className="w-full"
                  >
                    Select Free Plan
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-2 border-blue-500 relative">
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                  RECOMMENDED
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">Premium Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold mb-6">
                    KSh 1,500{" "}
                    <span className="text-sm font-normal text-gray-500">
                      /job post
                    </span>
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>Featured job listing</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>Priority visibility</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>Advanced candidate filtering</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>Verified employer badge</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handlePaymentComplete("Premium")}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Pay KSh 1,500
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                <CardDescription>
                  {category} • {type} • {location}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Edit Job
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Job Description</h3>
              <p className="whitespace-pre-line">{description}</p>
            </div>

            {selectedSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Compensation</h3>
                <p className="flex items-center text-gray-700">
                  <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                  KSh {salaryMin}
                  {salaryMax ? ` - KSh ${salaryMax}` : ""} ({salaryType},{" "}
                  {paymentFrequency})
                </p>
                {selectedBenefits.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Benefits:</p>
                    <p className="text-sm text-gray-600">
                      {selectedBenefits.join(", ")}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Work Details</h3>
                <p className="flex items-center text-gray-700">
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                  {location} {isRemote && "(Remote work available)"}
                </p>
                <p className="flex items-center text-gray-700 mt-1">
                  <Clock className="h-4 w-4 mr-1 text-gray-500" />
                  {workHours}
                </p>
                <p className="flex items-center text-gray-700 mt-1">
                  <Users className="h-4 w-4 mr-1 text-gray-500" />
                  {positions} position{parseInt(positions) !== 1 ? "s" : ""}{" "}
                  available
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Application Details
              </h3>
              <p className="flex items-center text-gray-700">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                Deadline: {new Date(deadline).toLocaleDateString()}
              </p>
              <div className="mt-2">
                <p className="text-sm font-medium">How to Apply:</p>
                <ul className="list-disc pl-5 text-sm text-gray-600">
                  {selectedApplicationMethods.map((method) => (
                    <li key={method}>{method}</li>
                  ))}
                </ul>
              </div>
              {contactPerson && (
                <p className="text-sm text-gray-600 mt-2">
                  Contact: {contactPerson}{" "}
                  {contactPhone ? `(${contactPhone})` : ""}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Back to Edit
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Posting Job..." : "Post Job Now"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Post a New Job</h1>
        <p className="text-gray-600">
          Fill in the details below to create a new job listing
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`flex flex-col items-center relative z-10 ${currentStep >= step ? "text-green-600" : "text-gray-400"}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep >= step ? "border-green-600 bg-green-50" : "border-gray-300 bg-white"}`}
              >
                {step}
              </div>
              <span className="text-xs mt-2 text-center">
                {step === 1 && "Basic Details"}
                {step === 2 && "Compensation"}
                {step === 3 && "Location"}
                {step === 4 && "Application"}
                {step === 5 && "Preferences"}
              </span>
            </div>
          ))}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">1. Basic Job Details</h2>

              <div>
                <Label htmlFor="title" className="text-base">
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. House Cleaner Needed, Motorbike Delivery Rider"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="h-12 mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-base">
                  Job Category <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 mt-1">
                    <SelectValue placeholder="Select job category" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobCategories.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name.toLowerCase()}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type" className="text-base">
                  Job Type <span className="text-red-500">*</span>
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-12 mt-1">
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

              <div>
                <Label htmlFor="description" className="text-base">
                  Job Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed job responsibilities and expectations. Example: Looking for a cleaner to maintain office spaces daily. Must be available from 7 AM to 4 PM, Monday to Friday."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="min-h-[150px] mt-1"
                />
              </div>

              <div>
                <Label className="text-base mb-2 block">Skills Required</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {skillsList.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill}`}
                        checked={selectedSkills.includes(skill)}
                        onCheckedChange={() => handleSkillToggle(skill)}
                      />
                      <label
                        htmlFor={`skill-${skill}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {skill}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="positions" className="text-base">
                  Number of Positions Available
                </Label>
                <Input
                  id="positions"
                  type="number"
                  min="1"
                  placeholder="e.g. 3"
                  value={positions}
                  onChange={(e) => setPositions(e.target.value)}
                  className="h-12 mt-1 w-full md:w-1/3"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                2. Compensation & Payment Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryType" className="text-base">
                    Salary Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={salaryType} onValueChange={setSalaryType}>
                    <SelectTrigger className="h-12 mt-1">
                      <SelectValue placeholder="Select salary type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixed Salary">Fixed Salary</SelectItem>
                      <SelectItem value="Hourly Wage">Hourly Wage</SelectItem>
                      <SelectItem value="Daily Rate">Daily Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentFrequency" className="text-base">
                    Payment Frequency <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={paymentFrequency}
                    onValueChange={setPaymentFrequency}
                  >
                    <SelectTrigger className="h-12 mt-1">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="salaryMin"
                    className="text-base flex items-center"
                  >
                    <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                    Minimum Salary (KSh) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    placeholder="e.g. 10000"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    required
                    className="h-12 mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="salaryMax"
                    className="text-base flex items-center"
                  >
                    <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                    Maximum Salary (KSh) (Optional)
                  </Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    placeholder="e.g. 15000"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="h-12 mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="paymentMethod" className="text-base">
                  Payment Method
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="h-12 mt-1">
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

              <div>
                <Label className="text-base mb-2 block">
                  Benefits (Optional)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center space-x-2">
                      <Checkbox
                        id={`benefit-${benefit}`}
                        checked={selectedBenefits.includes(benefit)}
                        onCheckedChange={() => handleBenefitToggle(benefit)}
                      />
                      <label
                        htmlFor={`benefit-${benefit}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {benefit}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                3. Location & Work Schedule
              </h2>

              <div>
                <Label
                  htmlFor="location"
                  className="text-base flex items-center"
                >
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                  Job Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Westlands, Nairobi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="h-12 mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the specific location or area where the job will be
                  performed
                </p>
              </div>

              <div>
                <Label
                  htmlFor="workHours"
                  className="text-base flex items-center"
                >
                  <Clock className="h-4 w-4 mr-1 text-gray-500" />
                  Work Hours / Shifts <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="workHours"
                  placeholder="e.g. Monday-Friday, 8 AM - 5 PM"
                  value={workHours}
                  onChange={(e) => setWorkHours(e.target.value)}
                  required
                  className="h-12 mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isRemote"
                  checked={isRemote}
                  onCheckedChange={setIsRemote}
                />
                <Label htmlFor="isRemote" className="cursor-pointer">
                  Remote Work Option
                </Label>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">4. Application Process</h2>

              <div>
                <Label
                  htmlFor="deadline"
                  className="text-base flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  Application Deadline <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="h-12 mt-1"
                />
              </div>

              <div>
                <Label className="text-base mb-2 block">
                  How to Apply? <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  {applicationMethods.map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        id={`method-${method}`}
                        checked={selectedApplicationMethods.includes(method)}
                        onCheckedChange={() =>
                          handleApplicationMethodToggle(method)
                        }
                      />
                      <label
                        htmlFor={`method-${method}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {method}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPerson" className="text-base">
                    Contact Person (Optional)
                  </Label>
                  <Input
                    id="contactPerson"
                    placeholder="e.g. John Doe"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="h-12 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone" className="text-base">
                    Contact Phone (Optional)
                  </Label>
                  <Input
                    id="contactPhone"
                    placeholder="e.g. 0712 345 678"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="h-12 mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                5. Job Posting Preferences
              </h2>

              <div>
                <Label htmlFor="visibility" className="text-base">
                  Job Visibility
                </Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger className="h-12 mt-1">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public">
                      Public (Anyone can see & apply)
                    </SelectItem>
                    <SelectItem value="Private">
                      Private (Only invited candidates can apply)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allowMessages"
                  checked={allowMessages}
                  onCheckedChange={setAllowMessages}
                />
                <Label htmlFor="allowMessages" className="cursor-pointer">
                  Allow Job Seeker Messages
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableNotifications"
                  checked={enableNotifications}
                  onCheckedChange={setEnableNotifications}
                />
                <Label htmlFor="enableNotifications" className="cursor-pointer">
                  Enable Notifications for Applications
                </Label>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-6">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              Previous
            </Button>
          ) : (
            <div></div>
          )}

          {currentStep < 5 ? (
            <Button
              onClick={nextStep}
              className="bg-green-600 hover:bg-green-700"
            >
              Next
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePreview}>
                Preview Job
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? "Posting Job..." : "Post Job Now"}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
