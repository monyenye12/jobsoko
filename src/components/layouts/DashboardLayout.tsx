import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import {
  Home,
  MapPin,
  Briefcase,
  MessageSquare,
  Bell,
  Calendar,
  DollarSign,
  User,
  FileText,
  Building,
  LogOut,
  Menu,
  X,
  BookmarkIcon,
  Users,
  ClipboardList,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardLayout() {
  const { user, userProfile, signOut } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEmployer, setIsEmployer] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setIsEmployer(userProfile.role === "employer");
    }
  }, [userProfile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = isEmployer
    ? [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: <Home className="h-5 w-5" />,
        },
        {
          name: "Post Job",
          path: "/dashboard/post-job",
          icon: <Briefcase className="h-5 w-5" />,
        },
        {
          name: "Manage Jobs",
          path: "/dashboard/manage-jobs",
          icon: <ClipboardList className="h-5 w-5" />,
        },
        {
          name: "Map View",
          path: "/dashboard/map-jobs",
          icon: <MapPin className="h-5 w-5" />,
        },
        {
          name: "Applicants",
          path: "/dashboard/applicants",
          icon: <Users className="h-5 w-5" />,
        },
        {
          name: "Messages",
          path: "/dashboard/messages",
          icon: <MessageSquare className="h-5 w-5" />,
        },
        {
          name: "Notifications",
          path: "/dashboard/notifications",
          icon: <Bell className="h-5 w-5" />,
        },
        {
          name: "Calendar",
          path: "/dashboard/calendar",
          icon: <Calendar className="h-5 w-5" />,
        },
        {
          name: "Payments",
          path: "/dashboard/payments",
          icon: <DollarSign className="h-5 w-5" />,
        },
        {
          name: "Profile",
          path: "/dashboard/profile",
          icon: <User className="h-5 w-5" />,
        },
        {
          name: "Company",
          path: "/dashboard/company",
          icon: <Building className="h-5 w-5" />,
        },
      ]
    : [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: <Home className="h-5 w-5" />,
        },
        {
          name: "Find Jobs",
          path: "/dashboard/map-jobs",
          icon: <MapPin className="h-5 w-5" />,
        },
        {
          name: "My Applications",
          path: "/dashboard/my-applications",
          icon: <Briefcase className="h-5 w-5" />,
        },
        {
          name: "Saved Jobs",
          path: "/dashboard/saved-jobs",
          icon: <BookmarkIcon className="h-5 w-5" />,
        },
        {
          name: "Messages",
          path: "/dashboard/messages",
          icon: <MessageSquare className="h-5 w-5" />,
        },
        {
          name: "Notifications",
          path: "/dashboard/notifications",
          icon: <Bell className="h-5 w-5" />,
        },
        {
          name: "Calendar",
          path: "/dashboard/calendar",
          icon: <Calendar className="h-5 w-5" />,
        },
        {
          name: "Profile",
          path: "/dashboard/profile",
          icon: <User className="h-5 w-5" />,
        },
        {
          name: "Resume",
          path: "/dashboard/resume",
          icon: <FileText className="h-5 w-5" />,
        },
      ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-green-600 dark:text-green-400">
              JobSoko
            </h1>
          </div>

          <div className="flex-1 overflow-auto py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${isActive(item.path) ? "bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300" : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"}`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                />
                <AvatarFallback>{userProfile?.fullName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {userProfile?.fullName || user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isEmployer ? "Employer" : "Job Seeker"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 h-16">
        <h1 className="text-xl font-bold text-green-600 dark:text-green-400">
          JobSoko
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75">
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-gray-800 overflow-y-auto">
            <div className="flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700 px-4">
              <h1 className="text-xl font-bold text-green-600 dark:text-green-400">
                JobSoko
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="px-2 py-4">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${isActive(item.path) ? "bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300" : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                  />
                  <AvatarFallback>{userProfile?.fullName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {userProfile?.fullName || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isEmployer ? "Employer" : "Job Seeker"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
          <div
            className="fixed inset-0"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        </div>
      )}

      {/* Main content */}
      <div className="md:ml-64 flex-1 flex flex-col">
        <div className="md:hidden h-16"></div> {/* Spacer for mobile header */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
