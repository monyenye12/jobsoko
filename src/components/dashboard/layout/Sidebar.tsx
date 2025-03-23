import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../supabase/auth.tsx";
import {
  Home,
  LayoutDashboard,
  Calendar,
  Settings,
  HelpCircle,
  FolderKanban,
  Briefcase,
  MessageSquare,
  Users,
  PlusCircle,
  MapPin,
  Star,
  FileText,
  Bell,
  DollarSign,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  isActive?: boolean;
  role?: "all" | "employer" | "job_seeker";
}

interface SidebarProps {
  items?: NavItem[];
  activeItem?: string;
  onItemClick?: (label: string) => void;
}

const Sidebar = ({
  activeItem = "Dashboard",
  onItemClick = () => {},
}: SidebarProps) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const isEmployer = userProfile?.role === "employer";

  const employerNavItems: NavItem[] = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      href: "/dashboard",
    },
    { icon: <Briefcase size={20} />, label: "Manage Jobs", href: "/dashboard" },
    { icon: <PlusCircle size={20} />, label: "Post Job", href: "/post-job" },
    {
      icon: <Users size={20} />,
      label: "Applicants",
      href: "/dashboard/applicants",
    },
    {
      icon: <FolderKanban size={20} />,
      label: "Task Board",
      href: "/dashboard/tasks",
    },
    {
      icon: <MessageSquare size={20} />,
      label: "Messages",
      href: "/dashboard",
    },
    { icon: <Calendar size={20} />, label: "Calendar", href: "/dashboard" },
  ];

  const jobSeekerNavItems: NavItem[] = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <MapPin size={20} />,
      label: "Find Jobs",
      href: "/dashboard/map-jobs",
    },
    {
      icon: <Briefcase size={20} />,
      label: "My Applications",
      href: "/dashboard",
    },
    { icon: <Star size={20} />, label: "Saved Jobs", href: "/dashboard" },
    {
      icon: <MessageSquare size={20} />,
      label: "Messages",
      href: "/dashboard",
    },
    { icon: <FileText size={20} />, label: "My Resume", href: "/dashboard" },
    { icon: <Calendar size={20} />, label: "Calendar", href: "/dashboard" },
  ];

  const bottomItems: NavItem[] = [
    { icon: <Bell size={20} />, label: "Notifications", href: "/dashboard" },
    {
      icon: <DollarSign size={20} />,
      label: "Payments",
      href: "/dashboard",
      role: "employer",
    },
    {
      icon: <HelpCircle size={20} />,
      label: "Support",
      href: "/dashboard/support",
    },
    { icon: <Settings size={20} />, label: "Settings", href: "/dashboard" },
  ];

  const navItems = isEmployer ? employerNavItems : jobSeekerNavItems;

  const filteredBottomItems = bottomItems.filter(
    (item) =>
      !item.role || item.role === "all" || item.role === userProfile?.role,
  );

  const handleItemClick = (item: NavItem) => {
    onItemClick(item.label);
    if (item.href) {
      navigate(item.href);
    }
  };

  return (
    <div className="w-[280px] h-full bg-white/80 backdrop-blur-md border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-900">
          {isEmployer ? "Employer Portal" : "Job Seeker Portal"}
        </h2>
        <p className="text-sm text-gray-500">
          {isEmployer
            ? "Manage your job listings and applicants"
            : "Find jobs and track applications"}
        </p>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1.5">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={"ghost"}
              className={`w-full justify-start gap-3 h-10 rounded-xl text-sm font-medium ${item.label === activeItem ? "bg-green-50 text-green-600 hover:bg-green-100" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => handleItemClick(item)}
            >
              <span
                className={`${item.label === activeItem ? "text-green-600" : "text-gray-500"}`}
              >
                {item.icon}
              </span>
              {item.label}
            </Button>
          ))}
        </div>

        <Separator className="my-4 bg-gray-100" />

        {isEmployer && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium px-4 py-1 text-gray-500 uppercase tracking-wider">
              Job Status
            </h3>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-9 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Active Jobs
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-9 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
              Pending Review
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-9 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              Closed Jobs
            </Button>
          </div>
        )}

        {!isEmployer && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium px-4 py-1 text-gray-500 uppercase tracking-wider">
              Application Status
            </h3>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-9 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              Pending
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-9 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Accepted
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-9 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              Rejected
            </Button>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 mt-auto border-t border-gray-200">
        {filteredBottomItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className="w-full justify-start gap-3 h-10 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 mb-1.5"
            onClick={() => handleItemClick(item)}
          >
            <span className="text-gray-500">{item.icon}</span>
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
