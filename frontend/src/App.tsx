import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import BusinessDashboard from "./pages/BusinessDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import SearchDevelopers from "./pages/SearchDevelopers";
import JobListings from "./pages/JobListings";
import JobDetail from "./pages/JobDetail";
import CreateJob from "./pages/CreateJob";
import EditJob from "./pages/EditJob";
import EditBusinessProfile from "./pages/EditBusinessProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<SearchDevelopers />} />
            <Route path="/jobs" element={<JobListings />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route
              path="/developer-dashboard"
              element={
                <ProtectedRoute allowedRoles={["developer"]}>
                  <DeveloperDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/business-dashboard"
              element={
                <ProtectedRoute allowedRoles={["business"]}>
                  <BusinessDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-job"
              element={
                <ProtectedRoute allowedRoles={["business"]}>
                  <CreateJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-job/:id"
              element={
                <ProtectedRoute allowedRoles={["business"]}>
                  <EditJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/business/profile/edit"
              element={
                <ProtectedRoute allowedRoles={["business"]}>
                  <EditBusinessProfile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
