import { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, CheckCircle } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check if this is a verification redirect
  const params = new URLSearchParams(location.search);
  const isVerified = params.get("verified") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // For demo purposes, we'll just use email login
      // In a real app, we would handle phone login differently
      if (loginMethod === "email") {
        await signIn(email, password);
      } else {
        // Mock phone login for demo
        if (phone === "712345678" && password === "password") {
          // Simulate login delay
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await signIn("demo@jobsoko.co.ke", password);
        } else {
          throw new Error("Invalid phone number or password");
        }
      }

      toast({
        title: "Login successful",
        description: "Welcome back to JobSoko!",
      });
      // Navigate to dashboard after successful login
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials for easy testing
  const fillDemoCredentials = () => {
    if (loginMethod === "email") {
      setEmail("demo@jobsoko.co.ke");
    } else {
      setPhone("712345678");
    }
    setPassword("password");
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md mx-auto">
        {isVerified && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-800">
                Email verified successfully!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Your account has been verified. You can now log in.
              </p>
            </div>
          </div>
        )}

        <Tabs
          defaultValue="email"
          className="mb-6"
          onValueChange={(value) => setLoginMethod(value as "email" | "phone")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
          <TabsContent value="email" className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Sign in with your email address
            </p>
          </TabsContent>
          <TabsContent value="phone" className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Sign in with your phone number (verification will be sent to your
              email)
            </p>
          </TabsContent>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-6">
          {loginMethod === "email" ? (
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
                disabled={loading}
              />
            </div>
          ) : (
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
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-green-600 hover:text-green-500"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            type="submit"
            className="w-full h-12 rounded-full bg-green-600 text-white hover:bg-green-700 text-sm font-medium"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-xs text-center text-gray-500 mt-4">
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={fillDemoCredentials}
            >
              Use demo credentials
            </button>
          </div>

          <div className="text-sm text-center text-gray-600 mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-green-600 hover:underline font-medium"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
