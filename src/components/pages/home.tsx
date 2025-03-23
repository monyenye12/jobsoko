import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BriefcaseBusiness,
  ChevronRight,
  MapPin,
  MessageSquare,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";

export default function LandingPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full bg-[rgba(255,255,255,0.8)] backdrop-blur-md border-b border-[#f5f5f7]/30">
        <div className="max-w-[1200px] mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-2xl text-green-600">
              JobSoko
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium hover:text-green-600"
                  >
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 hover:cursor-pointer">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt={user.email || ""}
                      />
                      <AvatarFallback>
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl border-none shadow-lg"
                  >
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      {user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={() => signOut()}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium hover:text-green-600"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="rounded-full bg-green-600 text-white hover:bg-green-700 text-sm px-4">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero section */}
        <section className="py-20 bg-gradient-to-b from-white to-green-50">
          <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-left mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900">
                Find Local Jobs <span className="text-green-600">Near You</span>{" "}
                in Kenya
              </h1>
              <h2 className="text-xl md:text-2xl font-medium text-gray-600 mb-6">
                Connect with informal and semi-formal job opportunities in your
                neighborhood
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/signup">
                  <Button className="w-full sm:w-auto rounded-full bg-green-600 text-white hover:bg-green-700 text-base px-6 py-6">
                    Find Jobs
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto rounded-full border-green-600 text-green-600 hover:bg-green-50 text-base px-6 py-6"
                  >
                    Post a Job
                  </Button>
                </Link>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Shield className="h-4 w-4 mr-2" />
                <span>Verified employers and secure job listings</span>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80"
                alt="Young Kenyan professionals"
                className="rounded-2xl shadow-lg w-full"
              />
            </div>
          </div>
        </section>

        {/* How it works section */}
        <section className="py-16 bg-white">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How JobSoko Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Simple steps to find work or hire talent in your local area
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-green-50 p-8 rounded-2xl text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Create Your Profile
                </h3>
                <p className="text-gray-600">
                  Sign up and create your profile with your skills and
                  experience. Choose whether you're looking for work or hiring.
                </p>
              </div>

              <div className="bg-green-50 p-8 rounded-2xl text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Find Local Opportunities
                </h3>
                <p className="text-gray-600">
                  Browse jobs on our map-based interface or post your job needs.
                  Filter by location and skills to find the perfect match.
                </p>
              </div>

              <div className="bg-green-50 p-8 rounded-2xl text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Connect & Work</h3>
                <p className="text-gray-600">
                  Apply with one click, message employers directly, and schedule
                  interviews. Start working and build your reputation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Job categories section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Popular Job Categories
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find opportunities across various sectors
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Construction", icon: "🏗️", count: 45 },
                { name: "Delivery", icon: "🛵", count: 32 },
                { name: "Cleaning", icon: "🧹", count: 28 },
                { name: "Retail", icon: "🛒", count: 36 },
                { name: "Hospitality", icon: "🍽️", count: 24 },
                { name: "Farming", icon: "🌱", count: 19 },
                { name: "Security", icon: "🔒", count: 15 },
                { name: "Driving", icon: "🚗", count: 22 },
              ].map((category, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate("/dashboard")}
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <h3 className="text-lg font-medium mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">
                    {category.count} jobs available
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link to="/signup">
                <Button className="rounded-full bg-green-600 text-white hover:bg-green-700 px-6">
                  View All Categories
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-16 bg-white">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose JobSoko
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Features designed for the Kenyan job market
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-green-50 p-8 rounded-2xl">
                <div className="flex items-start">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Hyper-Local Job Matching
                    </h3>
                    <p className="text-gray-600">
                      Find jobs within walking distance of your location. Our
                      map-based interface shows you exactly where the
                      opportunities are.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-8 rounded-2xl">
                <div className="flex items-start">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Trust & Safety
                    </h3>
                    <p className="text-gray-600">
                      Our rating system and job verification process helps you
                      find legitimate opportunities and trustworthy employers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-8 rounded-2xl">
                <div className="flex items-start">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Direct Communication
                    </h3>
                    <p className="text-gray-600">
                      Message employers directly through our in-app messaging
                      system. Schedule interviews and discuss job details
                      easily.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-8 rounded-2xl">
                <div className="flex items-start">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <BriefcaseBusiness className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      No Formal Qualifications Needed
                    </h3>
                    <p className="text-gray-600">
                      Focus on skills and experience rather than formal
                      education. Perfect for blue-collar and gig economy
                      positions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 bg-green-600 text-white">
          <div className="max-w-[1200px] mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Your Next Opportunity?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of Kenyan youth finding work in their local
              communities
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <Button className="w-full sm:w-auto rounded-full bg-white text-green-600 hover:bg-gray-100 text-base px-8 py-6">
                  Sign Up Now
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto rounded-full border-white text-white hover:bg-green-700 text-base px-8 py-6"
                >
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 text-sm">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-lg mb-4 text-green-400">JobSoko</h4>
              <p className="text-gray-400 mb-4">
                Connecting Kenyan youth with local job opportunities.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4">For Job Seekers</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-400 hover:text-white"
                  >
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="text-gray-400 hover:text-white">
                    Create Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-400 hover:text-white"
                  >
                    Job Alerts
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-400 hover:text-white"
                  >
                    Career Tips
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">For Employers</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/post-job"
                    className="text-gray-400 hover:text-white"
                  >
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-400 hover:text-white"
                  >
                    Browse Candidates
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-400 hover:text-white"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-400 hover:text-white"
                  >
                    Enterprise Solutions
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-400 hover:text-white"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-400 hover:text-white"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-400 hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-400 hover:text-white"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">
              © 2023 JobSoko. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
