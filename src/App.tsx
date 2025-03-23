import React, { Suspense } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
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
const MapJobView = React.lazy(() => import("./components/job/MapJobView"));
const CandidateManagement = React.lazy(
  () => import("./components/dashboard/CandidateManagement"),
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
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/success" element={<Success />} />
        <Route
          path="/post-job"
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
              <MapJobView />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/applicants"
          element={
            <PrivateRoute>
              <CandidateManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/tasks"
          element={
            <PrivateRoute>
              <TaskBoard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/support"
          element={
            <PrivateRoute>
              <ChatbotSupport />
            </PrivateRoute>
          }
        />
      </Routes>
      {/* For the tempo routes */}
      {import.meta.env.VITE_TEMPO && useRoutes(routes)}
    </>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingScreen text="Loading..." />}>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </Suspense>
  );
}

export default App;
