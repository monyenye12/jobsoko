import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import DashboardGrid from "../dashboard/DashboardGrid";
import TaskBoard from "../dashboard/TaskBoard";
import EmployerDashboard from "../dashboard/EmployerDashboard";
import JobSeekerDashboard from "../dashboard/JobSeekerDashboard";
import CandidateManagement from "../dashboard/CandidateManagement";
import ChatbotSupport from "../dashboard/ChatbotSupport";
import MapJobView from "../job/MapJobView";
import { Button } from "@/components/ui/button";
import { RefreshCw, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "../../../supabase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingScreen } from "@/components/ui/loading-spinner";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSidebarItem, setActiveSidebarItem] = useState("Dashboard");
  const { userProfile, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Set active tab based on URL path and user role
    const path = location.pathname;
    const isEmployerUser = userProfile?.role === "employer";

    if (path.includes("/applicants")) {
      setActiveTab("applicants");
      setActiveSidebarItem("Applicants");
    } else if (path.includes("/tasks")) {
      setActiveTab("tasks");
      setActiveSidebarItem("Task Board");
    } else if (path.includes("/support")) {
      setActiveTab("support");
      setActiveSidebarItem("Support");
    } else if (path.includes("/map-jobs")) {
      // Only job seekers should see map-jobs tab
      if (!isEmployerUser) {
        setActiveTab("map-jobs");
        setActiveSidebarItem("Find Jobs");
      } else {
        setActiveTab("dashboard");
        setActiveSidebarItem("Dashboard");
      }
    } else {
      setActiveTab("dashboard");
      setActiveSidebarItem("Dashboard");
    }
  }, [location, userProfile]); // Added userProfile as dependency

  // Function to trigger loading state for demonstration
  const handleRefresh = () => {
    setLoading(true);
    // Reset loading after 2 seconds
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleSidebarItemClick = (label: string) => {
    setActiveSidebarItem(label);
  };

  if (authLoading) {
    return <LoadingScreen text="Loading your dashboard..." />;
  }

  const isEmployer = userProfile?.role === "employer";

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar
          activeItem={activeSidebarItem}
          onItemClick={handleSidebarItemClick}
        />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 pt-4 pb-2 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              {isEmployer ? "Employer Dashboard" : "Job Seeker Dashboard"}
            </h1>
            <div className="flex gap-2">
              {isEmployer && (
                <Button
                  onClick={() => navigate("/post-job")}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 h-9 shadow-sm transition-colors flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Post a Job
                </Button>
              )}
              <Button
                onClick={handleRefresh}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 h-9 shadow-sm transition-colors flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>

          {isEmployer ? (
            <Tabs
              value={activeTab}
              className="container mx-auto px-6"
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-4 bg-white border border-gray-200 p-1 rounded-lg">
                <TabsTrigger
                  value="dashboard"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="applicants"
                  onClick={() => navigate("/dashboard/applicants")}
                >
                  Applicants
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  onClick={() => navigate("/dashboard/tasks")}
                >
                  Task Board
                </TabsTrigger>
                <TabsTrigger
                  value="support"
                  onClick={() => navigate("/dashboard/support")}
                >
                  Support
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-8">
                <EmployerDashboard />
              </TabsContent>

              <TabsContent value="applicants" className="space-y-8">
                <CandidateManagement />
              </TabsContent>

              <TabsContent value="tasks" className="space-y-8">
                <TaskBoard isLoading={loading} />
              </TabsContent>

              <TabsContent value="support" className="space-y-8">
                <ChatbotSupport />
              </TabsContent>
            </Tabs>
          ) : (
            <Tabs
              value={activeTab}
              className="container mx-auto px-6"
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-4 bg-white border border-gray-200 p-1 rounded-lg">
                <TabsTrigger
                  value="dashboard"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="map-jobs"
                  onClick={() => navigate("/dashboard/map-jobs")}
                >
                  Find Jobs
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  onClick={() => navigate("/dashboard/tasks")}
                >
                  Task Board
                </TabsTrigger>
                <TabsTrigger
                  value="support"
                  onClick={() => navigate("/dashboard/support")}
                >
                  Support
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-8">
                <JobSeekerDashboard />
              </TabsContent>

              <TabsContent value="map-jobs" className="space-y-8">
                <MapJobView />
              </TabsContent>

              <TabsContent value="tasks" className="space-y-8">
                <TaskBoard isLoading={loading} />
              </TabsContent>

              <TabsContent value="support" className="space-y-8">
                <ChatbotSupport />
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
