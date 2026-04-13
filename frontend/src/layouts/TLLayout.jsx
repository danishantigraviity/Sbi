import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../slices/authSlice";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Target,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const TLLayout = ({ toggleTheme, isDark }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navGroups = [
    {
      label: "Team",
      color: "Overview",
      items: [
        { name: "Dashboard", path: "/tl/dashboard", icon: LayoutDashboard },
        { name: "My Agents", path: "/tl/agents", icon: Users },
      ],
    },
    {
      label: "Work",
      color: "Management",
      items: [
        { name: "Tasks", path: "/tl/tasks", icon: ClipboardList },
        { name: "Leads", path: "/tl/leads", icon: Target },
      ],
    },
  ];

  const allNavItems = navGroups.flatMap((g) => g.items);

  const currentTitle =
    allNavItems.find((item) => item.path === window.location.pathname)?.name ||
    "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7] dark:bg-[#0B1120] text-[#1C1C1E] dark:text-[#E5E7EB]">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 270 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed lg:static z-50 h-full bg-white dark:bg-[#111827] border-r border-[#E5E5EA] dark:border-white/10 overflow-hidden shadow-sm flex-shrink-0"
      >
        <div className="flex flex-col h-full w-[270px]">
          {/* Logo */}
          <div className="p-6 pb-4 flex items-center gap-3 border-b border-[#E5E5EA] dark:border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#005DAB] to-[#007AFF] flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-sm">TL</span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#005DAB] dark:text-[#5AC8FA]">
                RedBank
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#FFD100]">
                Team Lead Portal
              </p>
            </div>
          </div>

          {/* User card */}
          <div className="mx-4 mt-4 p-3 rounded-2xl bg-gradient-to-r from-[#005DAB]/10 to-[#007AFF]/5 dark:from-[#005DAB]/20 dark:to-[#007AFF]/10 border border-[#005DAB]/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#005DAB] to-[#007AFF] flex items-center justify-center text-white font-black text-sm shadow-sm">
                {user?.name?.[0] || "T"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-[#1C1C1E] dark:text-white uppercase tracking-tight truncate">
                  {user?.name || "Team Lead"}
                </p>
                <p className="text-[10px] font-bold text-[#005DAB] dark:text-[#5AC8FA] uppercase tracking-widest">
                  Team Lead
                </p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.label}>
                <div className="px-3 mb-3 flex items-center gap-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1">
                    <span className="text-[#005DAB] dark:text-[#5AC8FA]">{group.label}</span>
                    <span className="text-[#FFD100]">{group.color}</span>
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#E5E5EA] to-transparent dark:from-white/10" />
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? "bg-[#005DAB]/10 dark:bg-[#005DAB]/20 text-[#005DAB] dark:text-[#5AC8FA]"
                            : "text-[#6E6E73] dark:text-[#9CA3AF] hover:bg-[#F2F2F7] dark:hover:bg-[#0B1120] hover:text-[#005DAB] dark:hover:text-[#5AC8FA]"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={`w-4.5 h-4.5 mr-3 transition-colors ${
                              isActive
                                ? "text-[#005DAB] dark:text-[#5AC8FA]"
                                : "text-[#9CA3AF] group-hover:text-[#005DAB] dark:group-hover:text-[#5AC8FA]"
                            }`}
                            style={{ width: 18, height: 18 }}
                          />
                          <span className="font-bold text-xs uppercase tracking-widest flex-1">
                            {item.name}
                          </span>
                          {isActive && (
                            <ChevronRight className="w-3.5 h-3.5 text-[#005DAB]/60 dark:text-[#5AC8FA]/60" />
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-[#E5E5EA] dark:border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2.5 rounded-xl text-[#FF3B30] dark:text-[#FF6B6B] hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-bold text-xs uppercase tracking-widest group"
            >
              <LogOut className="w-4 h-4 mr-3 group-hover:translate-x-0.5 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl border-b border-[#E5E5EA] dark:border-white/10 flex items-center justify-between px-6 z-40 sticky top-0 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl hover:bg-[#F2F2F7] dark:hover:bg-[#0B1120] text-[#6E6E73] hover:text-[#005DAB] transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-sm font-black uppercase tracking-widest hidden sm:flex items-center gap-1.5">
              {(() => {
                const parts = currentTitle.split(" ");
                if (parts.length === 1)
                  return <span className="text-[#005DAB] dark:text-[#5AC8FA]">{currentTitle}</span>;
                const [first, ...rest] = parts;
                return (
                  <>
                    <span className="text-[#005DAB] dark:text-[#5AC8FA]">{first}</span>
                    <span className="text-[#FFD100]">{rest.join(" ")}</span>
                  </>
                );
              })()}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#F2F2F7] dark:bg-[#0B1120] text-[#6E6E73] dark:text-[#E5E7EB] hover:text-[#005DAB] dark:hover:text-[#5AC8FA] transition-colors"
            >
              {isDark ? <Sun className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} /> : <Moon style={{ width: 18, height: 18 }} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TLLayout;
