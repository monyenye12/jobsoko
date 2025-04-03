import { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MapPin, Briefcase, Loader2 } from "lucide-react";
import { supabase } from "../../../supabase/supabase";

const jobCategories = [
  "Construction",
  "Delivery",
  "Cleaning",
  "Retail",
  "Hospitality",
  "Farming",
  "Security",
  "Driving",
  "Other",
];

export default function SignUpForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<"job_seeker" | "employer">(
    "job_seeker",
  );
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [preferredCategory, setPreferredCategory] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRoleChange = (value: "job_seeker" | "employer") => {
    setUserRole(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!fullName || !email || !password || !phone) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      console.log("Form submitted, preparing user data");

      // Validate role is one of the expected values
      const validatedRole = userRole === "employer" ? "employer" : "job_seeker";
      console.log("Validated role:", validatedRole);

      const userData = {
        fullName,
        role: validatedRole, // Use validated role
        phone,
        location,
        skills: skills ? skills.split(",").map((skill) => skill.trim()) : [],
        preferredCategory,
        businessName,
        businessType,
      };

      // We no longer need to store role in localStorage as we'll get it from the database
      // But we'll log it for debugging purposes
      console.log("Using role for signup:", validatedRole);

      console.log("Calling signUp function with data", {
        email,
        role: validatedRole,
      });
      try {
        await signUp(email, password, userData);
      } catch (signupError: any) {
        console.error("Detailed signup error:", signupError);
        // If there's a specific database error, provide a clearer message
        if (
          signupError.message &&
          signupError.message.includes("business_name")
        ) {
          throw new Error(
            "There was an issue with the business information. Please try again later.",
          );
        }
        throw signupError;
      }

      console.log("Signup successful, setting submitted state");
      setIsSubmitted(true);
      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || "An error occurred during signup");
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignup = () => {
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <AuthLayout>
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🎉</span>
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Congratulations!</h2>
            <p className="text-gray-600 mb-2">
              You have successfully signed up for JobSoko.
            </p>
            <p className="text-sm text-blue-600">
              Please check your email to verify your account before logging in.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full h-12 rounded-full bg-green-600 text-white hover:bg-green-700 text-sm font-medium mt-4"
          >
            Go to Login Page
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the email?
            </p>
            <button
              type="button"
              onClick={async () => {
                try {
                  const { error } = await supabase.auth.resend({
                    type: "signup",
                    email: email,
                    options: {
                      emailRedirectTo: `${window.location.origin}/login?verified=true`,
                    },
                  });

                  if (error) throw error;

                  toast({
                    title: "Verification email resent",
                    description:
                      "Please check your email for the verification link.",
                    duration: 3000,
                  });
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description:
                      error.message || "Failed to resend verification email",
                    variant: "destructive",
                    duration: 3000,
                  });
                }
              }}
              className="text-sm text-green-600 hover:underline font-medium"
            >
              Resend verification email
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md mx-auto">
        <Tabs defaultValue="email" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
          <TabsContent value="email" className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Sign up with your email address
            </p>
          </TabsContent>
          <TabsContent value="phone" className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Sign up with your phone number (verification will be sent to your
              email)
            </p>
          </TabsContent>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="fullName"
              className="text-sm font-medium text-gray-700"
            >
              Full Name
            </Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-12 rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700"
            >
              Phone Number
            </Label>
            <div className="flex">
              <div className="bg-gray-100 h-12 flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300">
                <Phone className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-gray-500">+254</span>
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="712 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="h-12 rounded-none rounded-r-lg border-gray-300 focus:ring-green-500 focus:border-green-500 flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">I am a:</Label>
            <RadioGroup
              value={userRole}
              onValueChange={handleRoleChange}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="job_seeker" id="job_seeker" />
                <Label htmlFor="job_seeker" className="cursor-pointer">
                  Job Seeker
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employer" id="employer" />
                <Label htmlFor="employer" className="cursor-pointer">
                  Employer
                </Label>
              </div>
            </RadioGroup>
          </div>

          {userRole === "job_seeker" ? (
            <div className="space-y-6 pt-2">
              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium text-gray-700 flex items-center"
                >
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                  Your Location
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Westlands, Nairobi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="skills"
                  className="text-sm font-medium text-gray-700"
                >
                  Skills (comma separated)
                </Label>
                <Input
                  id="skills"
                  placeholder="e.g. Construction, Painting, Carpentry"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="h-12 rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-sm font-medium text-gray-700"
                >
                  Preferred Job Category
                </Label>
                <Select
                  value={preferredCategory}
                  onValueChange={setPreferredCategory}
                >
                  <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobCategories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              <div className="space-y-2">
                <Label
                  htmlFor="businessName"
                  className="text-sm font-medium text-gray-700 flex items-center"
                >
                  <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
                  Business Name
                </Label>
                <Input
                  id="businessName"
                  placeholder="e.g. ABC Construction Ltd"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-12 rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="businessType"
                  className="text-sm font-medium text-gray-700"
                >
                  Business Type
                </Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobCategories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="employerLocation"
                  className="text-sm font-medium text-gray-700 flex items-center"
                >
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                  Business Location
                </Label>
                <Input
                  id="employerLocation"
                  placeholder="e.g. Industrial Area, Nairobi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            className="w-full h-12 rounded-full bg-green-600 text-white hover:bg-green-700 text-sm font-medium"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Continue"
            )}
          </Button>

          <div className="text-xs text-center text-gray-500 mt-6">
            By creating an account, you agree to our{" "}
            <Link
              to="/terms-of-service"
              className="text-green-600 hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy-policy"
              className="text-green-600 hover:underline"
            >
              Privacy Policy
            </Link>
          </div>

          <div className="text-sm text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
