import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "../../../supabase/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load components to improve initial load time
const EmployerDashboard = lazy(
  () => import("@/components/dashboard/EmployerDashboard"),
);
const JobSeekerDashboard = lazy(
  () => import("@/components/dashboard/JobSeekerDashboard"),
);
const MapJobView = lazy(() => import("@/components/job/MapJobView"));
const EnhancedPostJobForm = lazy(
  () => import("@/components/job/EnhancedPostJobForm"),
);
const Messages = lazy(() => import("@/pages/dashboard/Messages"));
const EmployerPayments = lazy(
  () => import("@/pages/dashboard/EmployerPayments"),
);
const ApplicantsPage = lazy(() => import("@/components/pages/applicants"));
const MyApplications = lazy(() => import("@/components/job/MyApplications"));
const SavedJobs = lazy(() => import("@/components/job/SavedJobs"));
const ResumeViewer = lazy(() => import("@/components/profile/ResumeViewer"));
const Settings = lazy(() => import("@/pages/dashboard/Settings"));
const ManageJobs = lazy(() => import("@/components/pages/manage-jobs"));

const DashboardFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

export default function DashboardRoutes() {
  const { userProfile } = useAuth();
  const isEmployer = userProfile?.role === "employer";

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<DashboardFallback />}>
              {isEmployer ? <EmployerDashboard /> : <JobSeekerDashboard />}
            </Suspense>
          }
        />
        <Route path="map-jobs" element={<MapJobView />} />
        <Route path="post-job" element={<EnhancedPostJobForm />} />
        <Route path="messages" element={<Messages />} />
        <Route path="payments" element={<EmployerPayments />} />
        <Route path="settings" element={<Settings />} />
        <Route path="applicants" element={<ApplicantsPage />} />
        <Route path="manage-jobs" element={<ManageJobs />} />
        <Route path="my-applications" element={<MyApplications />} />
        <Route path="saved-jobs" element={<SavedJobs />} />
        <Route path="resume" element={<ResumeViewer />} />
      </Route>
    </Routes>
  );
}
