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
      isActive: activeItem === "Dashboard",
      role: "all",
    },
    {
      icon: <Briefcase size={20} />,
      label: "Manage Jobs",
      href: "/dashboard/manage-jobs",
      isActive: activeItem === "Manage Jobs",
      role: "employer",
    },
    {
      icon: <Users size={20} />,
      label: "Applicants",
      href: "/dashboard/applicants",
      isActive: activeItem === "Applicants",
      role: "employer",
    },
    {
      icon: <PlusCircle size={20} />,
      label: "Post Job",
      href: "/dashboard/post-job",
      isActive: activeItem === "Post Job",
      role: "employer",
    },
    {
      icon: <MessageSquare size={20} />,
      label: "Messages",
      href: "/dashboard/messages",
      isActive: activeItem === "Messages",
      role: "all",
    },
    {
      icon: <Calendar size={20} />,
      label: "Calendar",
      href: "/dashboard/calendar",
      isActive: activeItem === "Calendar",
      role: "all",
    },
    {
      icon: <Bell size={20} />,
      label: "Notifications",
      href: "/dashboard/notifications",
      isActive: activeItem === "Notifications",
      role: "all",
    },
    {
      icon: <DollarSign size={20} />,
      label: "Payments",
      href: "/dashboard/payments",
      isActive: activeItem === "Payments",
      role: "employer",
    },
    {
      icon: <Settings size={20} />,
      label: "Settings",
      href: "/dashboard/settings",
      isActive: activeItem === "Settings",
      role: "all",
    },
    {
      icon: <HelpCircle size={20} />,
      label: "Help",
      href: "/dashboard/help",
      isActive: activeItem === "Help",
      role: "all",
    },
  ];

  const jobSeekerNavItems: NavItem[] = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      href: "/dashboard",
      isActive: activeItem === "Dashboard",
      role: "all",
    },
    {
      icon: <MapPin size={20} />,
      label: "Find Jobs",
      href: "/dashboard/map-jobs",
      isActive: activeItem === "Find Jobs",
      role: "job_seeker",
    },
    {
      icon: <Star size={20} />,
      label: "Saved Jobs",
      href: "/dashboard/saved-jobs",
      isActive: activeItem === "Saved Jobs",
      role: "job_seeker",
    },
    {
      icon: <FileText size={20} />,
      label: "My Applications",
      href: "/dashboard/my-applications",
      isActive: activeItem === "My Applications",
      role: "job_seeker",
    },
    {
      icon: <MessageSquare size={20} />,
      label: "Messages",
      href: "/dashboard/messages",
      isActive: activeItem === "Messages",
      role: "all",
    },
    {
      icon: <Calendar size={20} />,
      label: "Calendar",
      href: "/dashboard/calendar",
      isActive: activeItem === "Calendar",
      role: "all",
    },
    {
      icon: <Bell size={20} />,
      label: "Notifications",
      href: "/dashboard/notifications",
      isActive: activeItem === "Notifications",
      role: "all",
    },
    {
      icon: <Settings size={20} />,
      label: "Settings",
      href: "/dashboard/settings",
      isActive: activeItem === "Settings",
      role: "all",
    },
    {
      icon: <HelpCircle size={20} />,
      label: "Help",
      href: "/dashboard/help",
      isActive: activeItem === "Help",
      role: "all",
    },
  ];

  const navItems = isEmployer ? employerNavItems : jobSeekerNavItems;

  const handleNavItemClick = (label: string, href?: string) => {
    onItemClick(label);
    if (href) {
      navigate(href);
    }
  };

  return (
    <div className="h-full bg-background border-r flex flex-col">
      <div className="p-4 flex items-center">
        <h2 className="text-xl font-bold text-primary">JobSoko</h2>
      </div>
      <Separator />
      <ScrollArea className="flex-1 p-4">
        <nav className="grid gap-2">
          {navItems
            .filter(
              (item) => item.role === "all" || item.role === userProfile?.role,
            )
            .map((item) => (
              <Button
                key={item.label}
                variant={item.isActive ? "default" : "ghost"}
                className={`w-full justify-start ${item.isActive ? "bg-primary" : ""}`}
                onClick={() => handleNavItemClick(item.label, item.href)}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Button>
            ))}
        </nav>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
