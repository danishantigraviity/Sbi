import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../slices/authSlice";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarCheck,
  PhoneCall,
  TrendingUp,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Clock,
  Target,
  Navigation,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { connectSocket, disconnectSocket } from "../utils/socket";
import { useEffect } from "react";
const AdminLayout = ({ toggleTheme, isDark }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      connectSocket(user);
    }
    return () => disconnectSocket();
  }, [user]);
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };
  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Staff Management", path: "/admin/staff", icon: Users },
    { name: "Attendance", path: "/admin/attendance", icon: CalendarCheck },
    { name: "Tasks", path: "/admin/tasks", icon: ClipboardList },
    { name: "Call Monitoring", path: "/admin/calls", icon: PhoneCall },
    { name: "Leave Requests", path: "/admin/leaves", icon: Clock },
    { name: "Customer Leads", path: "/admin/leads", icon: Target },
    { name: "Sales Tracking", path: "/admin/sales", icon: TrendingUp },
    { name: "Live Tracking", path: "/admin/tracking", icon: Navigation },
    {
      name: "Duty Permissions",
      path: "/admin/work-permissions",
      icon: ShieldCheck,
    },
    { name: "Work Reports", path: "/admin/reports", icon: FileSpreadsheet },
  ];
  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7] dark:bg-[#0B1120] text-lead dark:text-[#E5E7EB]">
      {" "}
      {/* Sidebar */}{" "}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0 }}
        className={`fixed lg:static z-50 h-full bg-white dark:bg-[#111827] border-r border-[#E5E5EA] dark:border-white/10 overflow-hidden transition-all duration-300 shadow-sm`}
      >
        {" "}
        <div className="flex flex-col h-full w-[280px]">
          {" "}
          <NavLink
            to="/admin/dashboard"
            className="p-6 flex items-center mb-8 hover:opacity-80 transition-opacity"
          >
            {" "}
            <img
              src="/logo.png"
              alt="Forge India Logo"
              className="h-20 w-auto object-contain"
            />{" "}
          </NavLink>{" "}
          <nav className="flex-1 px-4 pb-4 space-y-8 overflow-y-auto custom-scrollbar">
            {/* Staff Management Section */}
            <div>
              <div className="px-4 mb-4 flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center">
                  <span className="text-[#005DAB] dark:text-[#5AC8FA]">Staff</span>
                  <span className="text-[#FFD100] ml-1.5 pt-0.5">Management</span>
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-[#E5E5EA]/50 to-transparent ml-4 opacity-50" />
              </div>
              <div className="space-y-1.5">
                {navItems.slice(0, 6).map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-2xl transition-all duration-200 group ${isActive ? "bg-[#005DAB]/10 dark:bg-[#005DAB]/20 text-[#005DAB] dark:text-[#5AC8FA]" : "text-sub hover:bg-[#F2F2F7] dark:hover:bg-[#0B1120] hover:text-[#005DAB] dark:hover:text-[#5AC8FA]"}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={`w-5 h-5 mr-3 transition-colors ${isActive ? "text-[#005DAB] dark:text-[#5AC8FA]" : "text-sub group-hover:text-[#005DAB] dark:group-hover:text-[#5AC8FA]"}`}
                        />
                        <span
                          className={`font-bold text-xs uppercase tracking-widest ${isActive ? "text-[#005DAB] dark:text-[#5AC8FA]" : ""}`}
                        >
                          {item.name}
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Fleet Operations Section */}
            <div>
              <div className="px-4 mb-4 flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center">
                  <span className="text-[#005DAB] dark:text-[#5AC8FA]">Fleet</span>
                  <span className="text-[#FFD100] ml-1.5 pt-0.5">Operations</span>
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-[#E5E5EA]/50 to-transparent ml-4 opacity-50" />
              </div>
              <div className="space-y-1.5">
                {navItems.slice(6).map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-2xl transition-all duration-200 group ${isActive ? "bg-[#005DAB]/10 dark:bg-[#005DAB]/20 text-[#005DAB] dark:text-[#5AC8FA]" : "text-sub hover:bg-[#F2F2F7] dark:hover:bg-[#0B1120] hover:text-[#005DAB] dark:hover:text-[#5AC8FA]"}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={`w-5 h-5 mr-3 transition-colors ${isActive ? "text-[#005DAB] dark:text-[#5AC8FA]" : "text-sub group-hover:text-[#005DAB] dark:group-hover:text-[#5AC8FA]"}`}
                        />
                        <span
                          className={`font-bold text-xs uppercase tracking-widest ${isActive ? "text-[#005DAB] dark:text-[#5AC8FA]" : ""}`}
                        >
                          {item.name}
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>{" "}
          <div className="p-4 border-t border-[#E5E5EA] dark:border-white/10">
            {" "}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3.5 rounded-2xl text-[#005DAB] dark:text-[#5AC8FA] hover:bg-blue-50 dark:hover:bg-white/5 transition-all duration-200 font-bold text-xs uppercase tracking-widest"
            >
              {" "}
              <LogOut className="w-5 h-5 mr-3" /> Logout{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </motion.aside>{" "}
      {/* Main Content */}{" "}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {" "}
        {/* Navbar */}{" "}
        <header className="h-20 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border-b border-[#E5E5EA] dark:border-white/10 flex items-center justify-between px-6 z-40 sticky top-0">
          {" "}
          <div className="flex items-center">
            {" "}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 mr-4 text-sub hover:text-[#005DAB] lg:hidden"
            >
              {" "}
              {isSidebarOpen ? <X /> : <Menu />}{" "}
            </button>{" "}
            <h1 className="text-sm font-bold uppercase tracking-widest hidden sm:block">
              {(() => {
                const title =
                  navItems.find((item) => item.path === window.location.pathname)
                    ?.name || "Dashboard";
                const parts = title.split(" ");
                if (parts.length === 1) {
                  return (
                    <span className="text-[#005DAB] dark:text-[#5AC8FA]">
                      {title}
                    </span>
                  );
                }
                const [first, ...rest] = parts;
                return (
                  <span className="flex items-center">
                    <span className="text-[#005DAB] dark:text-[#5AC8FA]">
                      {first}
                    </span>
                    <span className="text-[#FFD100] ml-1.5">{rest.join(" ")}</span>
                  </span>
                );
              })()}
            </h1>{" "}
          </div>{" "}
          <div className="flex items-center space-x-6">
            {" "}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-[#F2F2F7] dark:bg-[#0B1120] text-sub dark:text-[#E5E7EB] hover:text-[#005DAB] dark:hover:text-[#5AC8FA] transition-colors"
            >
              {" "}
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}{" "}
            </button>{" "}
            <div className="flex items-center bg-[#F2F2F7] dark:bg-[#0B1120] px-4 py-2 rounded-2xl border border-[#E5E5EA] dark:border-white/10">
              {" "}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#005DAB] to-[#007AFF] flex items-center justify-center text-white text-sm font-bold mr-3 shadow-sm">
                {" "}
                {user?.name?.[0] || "U"}{" "}
              </div>{" "}
              <div className="hidden md:block">
                {" "}
                <p className="text-xs font-bold text-lead dark:text-[#E5E7EB] leading-tight uppercase tracking-tight">
                  {user?.name || "User"}
                </p>{" "}
                <p className="text-[10px] text-[#005DAB] dark:text-[#5AC8FA] font-bold uppercase tracking-widest leading-none mt-1">
                  {user?.role}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </header>{" "}
        {/* Page Content */}{" "}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {" "}
          <Outlet />{" "}
        </main>{" "}
      </div>{" "}
    </div>
  );
};
export default AdminLayout;
