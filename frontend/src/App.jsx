import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStaff from "./pages/admin/Staff";
import AdminAttendance from "./pages/admin/Attendance";
import AdminTasks from "./pages/admin/Tasks";
import AdminCalls from "./pages/admin/Calls";
import AdminSales from "./pages/admin/Sales";
import AdminLeaves from "./pages/admin/LeaveManagement";
import AdminLeads from "./pages/admin/Leads";
import AdminLiveTracking from "./pages/admin/LiveTracking";
import AdminWorkPermissions from "./pages/admin/WorkPermissions";
import SellerDashboard from "./pages/seller/Dashboard";
import SellerLeads from "./pages/seller/Leads";
import SellerTasks from "./pages/seller/Tasks";
import SellerAttendance from "./pages/seller/Attendance";
import SellerAutocall from "./pages/seller/CallDashboard";
import SellerLeaves from "./pages/seller/Leaves";
import SellerDutyPermissions from "./pages/seller/DutyPermissions";
import WorkReports from "./pages/shared/WorkReports";
import AdminLayout from "./layouts/AdminLayout";
import SellerLayout from "./layouts/SellerLayout";
import TLLayout from "./layouts/TLLayout";
import TLDashboard from "./pages/tl/Dashboard";
import TLAgents from "./pages/tl/Agents";
import TLTasks from "./pages/tl/Tasks";
import TLLeads from "./pages/tl/Leads";
import ErrorBoundary from "./components/ErrorBoundary";
import EnrollmentModal from "./components/EnrollmentModal";
import axios from "axios";

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [showEnrollment, setShowEnrollment] = React.useState(false);
  const [isEnrolled, setIsEnrolled] = React.useState(true); // Default to true to prevent flickering
  const [isDark, setIsDark] = React.useState(
    localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
  );

  useEffect(() => {
    const checkBioEnrollment = async () => {
      if (isAuthenticated && user) {
        try {
          const { data } = await axios.get('/api/auth/check-enrollment', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setIsEnrolled(data.enrolled);
          if (!data.enrolled) setShowEnrollment(true);
        } catch (err) {
          console.error("Failed to check biometric enrollment status");
        }
      }
    };
    checkBioEnrollment();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0B1120] text-lead dark:text-[#E5E7EB] transition-colors duration-300">
      <ErrorBoundary>
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated || !user || !user.role ? (
                <Login toggleTheme={toggleTheme} isDark={isDark} />
              ) : (
                <Navigate
                  to={
                    user.role === "admin"
                      ? "/admin/dashboard"
                      : user.role === "tl"
                      ? "/tl/dashboard"
                      : "/seller/dashboard"
                  }
                  replace
                />
              )
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              isAuthenticated && user?.role === "admin" ? (
                <AdminLayout toggleTheme={toggleTheme} isDark={isDark} />
              ) : isAuthenticated && user?.role === "seller" ? (
                <Navigate to="/seller/dashboard" replace />
              ) : isAuthenticated && user?.role === "tl" ? (
                <Navigate to="/tl/dashboard" replace />
              ) : (
                <Navigate to="/admin/login" replace />
              )
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="calls" element={<AdminCalls />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="leaves" element={<AdminLeaves />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="tracking" element={<AdminLiveTracking />} />
            <Route path="work-permissions" element={<AdminWorkPermissions />} />
            <Route path="reports" element={<WorkReports />} />
          </Route>

          {/* TL Routes */}
          <Route
            path="/tl"
            element={
              isAuthenticated && user?.role === "tl" ? (
                <TLLayout toggleTheme={toggleTheme} isDark={isDark} />
              ) : isAuthenticated && user?.role === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : isAuthenticated && user?.role === "seller" ? (
                <Navigate to="/seller/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<Navigate to="/tl/dashboard" />} />
            <Route path="dashboard" element={<TLDashboard />} />
            <Route path="agents" element={<TLAgents />} />
            <Route path="tasks" element={<TLTasks />} />
            <Route path="leads" element={<TLLeads />} />
          </Route>

          {/* Seller Routes */}
          <Route
            path="/seller"
            element={
              isAuthenticated && user?.role === "seller" ? (
                <SellerLayout toggleTheme={toggleTheme} isDark={isDark} />
              ) : isAuthenticated && user?.role === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<Navigate to="/seller/dashboard" />} />
            <Route path="dashboard" element={<SellerDashboard />} />
            <Route path="leads" element={<SellerLeads />} />
            <Route path="tasks" element={<SellerTasks />} />
            <Route path="attendance" element={<SellerAttendance />} />
            <Route path="autocall" element={<SellerAutocall />} />
            <Route path="leaves" element={<SellerLeaves />} />
            <Route
              path="duty-permissions"
              element={<SellerDutyPermissions />}
            />
            <Route path="reports" element={<WorkReports />} />
          </Route>

          <Route
            path="/"
            element={
              isAuthenticated && user?.role === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : isAuthenticated && user?.role === "tl" ? (
                <Navigate to="/tl/dashboard" replace />
              ) : isAuthenticated && user?.role === "seller" ? (
                <Navigate to="/seller/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="*"
            element={
              isAuthenticated && user?.role === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : isAuthenticated && user?.role === "tl" ? (
                <Navigate to="/tl/dashboard" replace />
              ) : isAuthenticated && user?.role === "seller" ? (
                <Navigate to="/seller/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>

        <EnrollmentModal 
          isOpen={showEnrollment} 
          onClose={() => setShowEnrollment(false)} 
          onComplete={() => setIsEnrolled(true)}
        />
      </ErrorBoundary>
    </div>
  );
}

export default App;
