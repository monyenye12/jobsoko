import React, { Suspense } from "react";
import { Routes, Route, useRoutes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { AuthProvider, PrivateRoute } from "../supabase/auth";

// Lazy load components for better performance
const Home = React.lazy(() => import("./components/pages/home"));
const LoginForm = React.lazy(() => import("./components/auth/LoginForm"));
const SignUpForm = React.lazy(() => import("./components/auth/SignUpForm"));
const Dashboard = React.lazy(() => import("./components/pages/dashboard"));
const Success = React.lazy(() => import("./components/pages/success"));
const PostJob = React.lazy(() => import("./components/pages/post-job"));
const MapJobsPage = React.lazy(() => import("./components/pages/map-jobs"));
const SavedJobsPage = React.lazy(() => import("./components/pages/saved-jobs"));
const MyApplicationsPage = React.lazy(
  () => import("./components/pages/my-applications"),
);
const MessagesPage = React.lazy(() => import("./components/pages/messages"));
const NotificationsPage = React.lazy(
  () => import("./components/pages/notifications"),
);
const CalendarPage = React.lazy(() => import("./components/pages/calendar"));
const ProfilePage = React.lazy(() => import("./components/pages/profile"));
const ResumePage = React.lazy(() => import("./components/pages/resume"));
const PrivacyPolicyPage = React.lazy(
  () => import("./components/pages/privacy-policy"),
);
const TermsOfServicePage = React.lazy(
  () => import("./components/pages/terms-of-service"),
);
const AboutUsPage = React.lazy(() => import("./components/pages/about-us"));
const ManageJobsPage = React.lazy(
  () => import("./components/pages/manage-jobs"),
);
const ApplicantsPage = React.lazy(
  () => import("./components/pages/applicants"),
);
const TaskBoard = React.lazy(() => import("./components/dashboard/TaskBoard"));
const ChatbotSupport = React.lazy(
  () => import("./components/dashboard/ChatbotSupport"),
);

// Import routes for Tempo
import routes from "tempo-routes";

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/manage-jobs"
          element={
            <PrivateRoute>
              <ManageJobsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/post-job"
          element={
            <PrivateRoute>
              <PostJob />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/map-jobs"
          element={
            <PrivateRoute>
              <MapJobsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/saved-jobs"
          element={
            <PrivateRoute>
              <SavedJobsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/my-applications"
          element={
            <PrivateRoute>
              <MyApplicationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/messages"
          element={
            <PrivateRoute>
              <MessagesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/notifications"
          element={
            <PrivateRoute>
              <NotificationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/calendar"
          element={
            <PrivateRoute>
              <CalendarPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/resume"
          element={
            <PrivateRoute>
              <ResumePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/applicants"
          element={
            <PrivateRoute>
              <ApplicantsPage />
            </PrivateRoute>
          }
        />
        <Route path="/success" element={<Success />} />
        {/* Add Tempo routes if in development */}
        {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingScreen />}>
        {/* For Tempo routes */}
        {import.meta.env.VITE_TEMPO && useRoutes(routes)}
        <AppRoutes />
        <Toaster />
      </Suspense>
    </AuthProvider>
  );
}

export default App;
