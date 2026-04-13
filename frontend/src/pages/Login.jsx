import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { loginSuccess } from '../slices/authSlice';
import { Mail, Lock, ShieldCheck, Sun, Moon, ArrowLeft, Loader2, UserCircle } from 'lucide-react';
import FaceScanner from '../components/FaceScanner';

const Login = ({ toggleTheme, isDark }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isFallback, setIsFallback] = useState(false); // Start with Face Lock
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAuthSuccess = (data) => {
    dispatch(loginSuccess(data));
    const role = data.user.role;
    
    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'tl') {
      navigate('/tl/dashboard', { replace: true });
    } else if (role === 'seller') {
      navigate('/seller/dashboard', { replace: true });
    } else {
      toast.error('Unrecognized role access');
    }
  };

  const getCoordinates = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: null, lng: null });
      const timeoutId = setTimeout(() => resolve({ lat: null, lng: null }), 5000);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeoutId);
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          clearTimeout(timeoutId);
          resolve({ lat: null, lng: null });
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    });
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const coords = await getCoordinates();
    try {
      const { data } = await axios.post('/api/auth/login', { email, password, ...coords });
      handleAuthSuccess(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLogin = async (images) => {
    setLoading(true);
    const coords = await getCoordinates();
    try {
      // Role is not required anymore as we search globally
      const { data } = await axios.post('/api/auth/face-login', { images, ...coords });
      handleAuthSuccess(data);
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      if (err.response?.data?.type === 'NO_ENROLLMENT') {
        toast.error('Face not enrolled. Switch to manual login.');
        setIsFallback(true);
      } else if (newAttempts >= 3) {
        toast.error('Multiple failures. Entering manual override...');
        setIsFallback(true);
      } else {
        toast.error(`Recognition failed (${newAttempts}/3). Adjust lighting and try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-[#F5F5F7] to-[#E5E5EA] dark:from-[#0B1120] dark:to-[#0B0B0F] selection:bg-[#005DAB] selection:text-white">
      {/* Theme Toggle */}
      <div className="absolute top-8 right-8 z-50">
        <button 
          onClick={toggleTheme} 
          className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border border-[#E5E5EA] dark:border-white/10 shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          {isDark ? <Sun className="w-6 h-6 text-[#FFD100]" /> : <Moon className="w-6 h-6 text-[#005DAB]" />}
        </button>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden border border-white/20 dark:border-white/5"
      >
        <div className="p-8 md:p-12">
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-10">
            <motion.img 
              initial={{ y: -10 }} 
              animate={{ y: 0 }} 
              src="/logo.png" 
              alt="Logo" 
              className="h-16 w-auto object-contain mb-6" 
            />
            <h2 className="text-2xl font-black text-[#1C1C1E] dark:text-white uppercase tracking-widest text-center">
              Secure <span className="text-[#005DAB] dark:text-[#5AC8FA]">Access</span> Gateway
            </h2>
            <div className="h-1 w-12 bg-gradient-to-r from-[#005DAB] to-[#FFD100] rounded-full mt-3"></div>
          </div>

          <AnimatePresence mode="wait">
            {!isFallback ? (
              <motion.div 
                key="biometric"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex flex-col items-center text-center">
                  <FaceScanner 
                    mode="verify" 
                    targetSamples={1} 
                    onCapture={handleFaceLogin} 
                    autoStart={true} 
                    isLoading={loading} 
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => setIsFallback(true)} 
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-white/5 text-[#6E6E73] dark:text-sub font-black text-[10px] uppercase tracking-[0.2em] hover:text-[#005DAB] dark:hover:text-[#5AC8FA] transition-all"
                  >
                    <Lock className="w-4 h-4" /> Enter Manual Override
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="manual"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <form onSubmit={handleManualLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-sub px-1">Identity Tag</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-sub group-focus-within:text-[#005DAB] transition-colors" />
                      <input 
                        type="email" 
                        placeholder="Registration Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full pl-14 pr-6 py-5 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border border-transparent dark:border-white/10 outline-none text-[#1C1C1E] dark:text-white placeholder:text-sub/40 font-bold transition-all focus:ring-4 focus:ring-[#005DAB]/10 focus:border-[#005DAB] dark:focus:border-[#5AC8FA]" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-sub px-1">Security Key</label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-sub group-focus-within:text-[#005DAB] transition-colors" />
                      <input 
                        type="password" 
                        placeholder="Authentication Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full pl-14 pr-6 py-5 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border border-transparent dark:border-white/10 outline-none text-[#1C1C1E] dark:text-white placeholder:text-sub/40 font-bold transition-all focus:ring-4 focus:ring-[#005DAB]/10 focus:border-[#005DAB] dark:focus:border-[#5AC8FA]" 
                        required 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#005DAB] to-[#007AFF] text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-[#005DAB]/20 hover:shadow-[#005DAB]/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    Confirm Identity
                  </button>

                  <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-[#F2F2F7] dark:border-white/5">
                    <button 
                      type="button" 
                      onClick={() => setIsFallback(false)} 
                      className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white dark:bg-white/5 border border-[#E5E5EA] dark:border-white/10 text-[#005DAB] dark:text-[#5AC8FA] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-50 dark:hover:bg-white/10 transition-all shadow-sm"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Biometric Scan
                    </button>
                    
                    <p className="text-[9px] text-center text-sub font-bold uppercase tracking-widest leading-relaxed px-10">
                      Protected by hardware-accelerated encryption & biometric verification
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[50%] h-[50%] bg-[#005DAB]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[50%] h-[50%] bg-[#FFD100]/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
};

export default Login;
