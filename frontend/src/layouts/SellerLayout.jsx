import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../slices/authSlice';
import { 
  BarChart3, 
  ClipboardList, 
  CalendarCheck, 
  LogOut, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  UserPlus, 
  ShieldCheck, 
  PhoneOutgoing, 
  Clock, 
  FileSpreadsheet 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FaceScanner from '../components/FaceScanner';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useLocationTracker from '../hooks/useLocationTracker';

const SellerLayout = ({ toggleTheme, isDark }) => {
  useLocationTracker(); /* Initialize live tracking */
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLogoutScanner, setShowLogoutScanner] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [usePasswordFallback, setUsePasswordFallback] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getCoordinates = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by your browser');
        return resolve({ lat: null, lng: null });
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          console.error('[GEOLOC] Error:', err.message);
          resolve({ lat: null, lng: null });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const handleVerifiedLogout = async (images) => {
    setIsVerifying(true);
    const coords = await getCoordinates();
    try {
      await axios.post('/api/seller/verify-logout', { images, ...coords }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Identity verified. Logging out...');
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordLogout = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    const coords = await getCoordinates();
    try {
      const { data } = await axios.post('/api/seller/verify-password-logout', { 
        password: verifyPassword, 
        ...coords 
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success(data.message);
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const navItems = [
    { name: 'My Stats', path: '/seller/dashboard', icon: BarChart3 },
    { name: 'Leads Management', path: '/seller/leads', icon: UserPlus },
    { name: 'Task Board', path: '/seller/tasks', icon: ClipboardList },
    { name: 'Attendance', path: '/seller/attendance', icon: CalendarCheck },
    { name: 'Leaves', path: '/seller/leaves', icon: Clock },
    { name: 'Duty Permissions', path: '/seller/duty-permissions', icon: ShieldCheck },
    { name: 'Autocall CRM', path: '/seller/autocall', icon: PhoneOutgoing },
    { name: 'Work Reports', path: '/seller/reports', icon: FileSpreadsheet },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7] dark:bg-[#0B1120] text-lead dark:text-[#E5E7EB]">
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0 }}
        className={`fixed lg:static z-50 h-full bg-white dark:bg-[#111827] border-r border-[#E5E5EA] dark:border-white/10 overflow-hidden transition-all duration-300 shadow-sm`}
      >
        <div className="flex flex-col h-full w-[280px]">
          <NavLink to="/seller/dashboard" className="p-6 flex items-center mb-8 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Forge India Logo" className="h-20 w-auto object-contain" />
          </NavLink>
          <nav className="flex-1 px-4 pb-4 space-y-2 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-[#005DAB]/10 dark:bg-[#005DAB]/20 text-[#005DAB] dark:text-[#5AC8FA]' 
                      : 'text-sub hover:bg-[#F2F2F7] dark:hover:bg-[#0B1120] hover:text-[#005DAB]'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-bold text-xs uppercase tracking-widest">{item.name}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-[#E5E5EA]">
            <button onClick={() => {
              setUsePasswordFallback(false);
              setShowLogoutScanner(true);
            }} className="flex items-center w-full px-4 py-3.5 rounded-2xl text-[#005DAB] hover:bg-blue-50 transition-all font-bold text-xs uppercase tracking-widest">
              <LogOut className="w-5 h-5 mr-3" /> Logout
            </button>
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <header className="h-20 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border-b border-[#E5E5EA] dark:border-white/10 flex items-center justify-between px-6 z-40 sticky top-0">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 mr-4 text-sub hover:text-[#005DAB] lg:hidden">
              {isSidebarOpen ? <X /> : <Menu />}
            </button>
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
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-[#F2F2F7] dark:bg-[#0B1120] text-sub dark:text-[#E5E7EB]">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center bg-[#F2F2F7] dark:bg-[#0B1120] px-4 py-2 rounded-2xl border border-[#E5E5EA] dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#005DAB] to-[#007AFF] flex items-center justify-center text-white text-sm font-bold mr-3 shadow-md">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-lead leading-tight uppercase tracking-tight">{user?.name || 'User'}</p>
                <p className="text-[10px] text-[#005DAB] font-bold uppercase tracking-widest leading-none mt-1">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {showLogoutScanner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !isVerifying && setShowLogoutScanner(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-[3rem] shadow-2xl p-10 overflow-hidden border dark:border-white/10">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#005DAB] to-[#007AFF]" />
              <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col">
                  <h3 className="text-3xl font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight">Identity Access</h3>
                  <p className="text-[10px] font-bold text-[#005DAB] uppercase tracking-widest mt-1">Authorized Verification Required</p>
                </div>
                <button onClick={() => setShowLogoutScanner(false)} className="p-2 hover:bg-blue-50 rounded-full text-[#005DAB]"> <X /> </button>
              </div>

              {!usePasswordFallback ? (
                <div className="space-y-6">
                  <FaceScanner mode="verify" onCapture={handleVerifiedLogout} />
                  <button 
                    onClick={() => setUsePasswordFallback(true)}
                    className="w-full text-center text-xs font-bold text-[#005DAB] uppercase tracking-widest hover:underline"
                  >
                    Use Password instead
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordLogout} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-[#F2F2F7] dark:bg-[#0B1120] rounded-2xl border border-[#E5E5EA] dark:border-white/10">
                      <ShieldCheck className="w-5 h-5 text-[#005DAB]" />
                      <input 
                        type="password"
                        placeholder="SECURITY ACCESS KEY"
                        className="flex-1 bg-transparent border-none outline-none text-xs font-bold tracking-widest"
                        value={verifyPassword}
                        onChange={(e) => setVerifyPassword(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <button 
                      type="submit"
                      disabled={isVerifying}
                      className="w-full py-4 bg-gradient-to-r from-[#005DAB] to-[#007AFF] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isVerifying ? 'AUTHENTICATING...' : 'AUTHORIZE LOGOUT'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setUsePasswordFallback(false)}
                      className="w-full text-center text-[10px] font-bold text-sub uppercase tracking-widest hover:text-[#005DAB]"
                    >
                      Back to Face scan
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerLayout;
