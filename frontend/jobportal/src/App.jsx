import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import JobsList from "./pages/JobsList";
import JobDetail from "./pages/JobDetail";
import CandidateApplications from "./pages/CandidateApplications";
import CandidateProfile from "./pages/CandidateProfile";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterJobs from "./pages/RecruiterJobs";
import RecruiterManageJobs from "./pages/RecruiterManageJobs";
import CandidateDashboard from "./pages/CandidateDashboard";
import SavedJobs from "./pages/SavedJobs";
import RecommendedJobs from "./pages/RecommendedJobs";
import CandidateAlerts from "./pages/CandidateAlerts";
import RecruiterCompany from "./pages/RecruiterCompany";
import RecruiterAnalytics from "./pages/RecruiterAnalytics"; // 🔹 NEW
import RecruiterProfile from "./pages/RecruiterProfile";
import CandidateJobTest from "./pages/CandidateJobTest";
import Sidebar from "./components/Sidebar";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Sidebar />
        <div className="app-container">
          <Routes>
            {/* Keep landing as jobs OR change later if you want */}
            <Route path="/" element={<JobsList />} />
            <Route path="/jobs" element={<JobsList />} />

            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute>
                  <JobDetail />
                </ProtectedRoute>
              }
            />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/candidate/profile"
              element={
                <ProtectedRoute>
                  <CandidateProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/applications"
              element={
                <ProtectedRoute>
                  <CandidateApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/dashboard"
              element={
                <ProtectedRoute>
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/jobs"
              element={
                <ProtectedRoute>
                  <RecruiterJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/manage-jobs"
              element={
                <ProtectedRoute>
                  <RecruiterManageJobs />
                </ProtectedRoute>
              }
            />

            {/* 🔹 NEW Recruiter Analytics route */}
            <Route
              path="/recruiter/analytics"
              element={
                <ProtectedRoute>
                  <RecruiterAnalytics />
                </ProtectedRoute>
              }
            />

            <Route
              path="/candidate/dashboard"
              element={
                <ProtectedRoute>
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/saved-jobs"
              element={
                <ProtectedRoute>
                  <SavedJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/recommended-jobs"
              element={
                <ProtectedRoute>
                  <RecommendedJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/alerts"
              element={
                <ProtectedRoute>
                  <CandidateAlerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/company"
              element={
                <ProtectedRoute>
                  <RecruiterCompany />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/profile"
              element={<RecruiterProfile />
              }
            />
            <Route
              path="/candidate/test/:applicationId"
              element={<CandidateJobTest />
              }
            />


            {/* Optional: fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
