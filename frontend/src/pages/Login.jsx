import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { loginSuccess } from '../slices/authSlice';
import { Mail, Lock, UserCheck, ShieldCheck, Sun, Moon } from 'lucide-react';
import FaceScanner from '../components/FaceScanner';

const Login = ({ toggleTheme, isDark }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState('credentials'); // 'credentials' or 'biometric'
  const [preAuthUser, setPreAuthUser] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getCoordinates = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: null, lng: null });
      
      const timeoutId = setTimeout(() => {
        console.warn('[AUTH] Geolocation timed out after 5s');
        resolve({ lat: null, lng: null });
      }, 5000);

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

  const handleVerifyCredentials = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/verify-credentials', { email, password });
      if (data.success) {
        setPreAuthUser(data.user);
        setPhase('biometric');
        toast.success("Credential Identity Verified. Proceeding to Biometric Scan.", {
          icon: '🛡️',
          style: { background: '#F2F2F7', color: '#005DAB', borderRadius: '1rem', fontWeight: 'bold' }
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLogin = async (images) => {
    setLoading(true);
    const coords = await getCoordinates();
    try {
      const { data } = await axios.post('/api/auth/face-login', { 
        userId: preAuthUser?.id, 
        images, 
        ...coords 
      });
      
      dispatch(loginSuccess(data));
      
      // Automatic role-based redirection
      const destination = data.user.role === 'admin' ? '/admin/dashboard' : '/seller/dashboard';
      toast.success(`Welcome back, ${data.user.name}`, { icon: '✨' });
      navigate(destination, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Biometric verification failed');
      // Option to go back if face fails repeatedly
      if (err.response?.status === 401) {
        setPhase('credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-[#F5F5F7] to-[#E5E5EA] dark:from-[#0B1120] dark:to-[#0B0B0F]">
      <div className="absolute top-8 right-8">
        <button onClick={toggleTheme} className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border border-[#E5E5EA] dark:border-white/10 shadow-2xl">
          {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white dark:bg-[#111827] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 dark:border-white/5">
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <img src="/logo.png" alt="Forge India Logo" className="h-24 w-auto object-contain" />
          </div>

          <h2 className="text-3xl font-bold text-center mb-2 text-[#005DAB] dark:text-[#5AC8FA] uppercase tracking-tight">
            Secure Terminal
          </h2>
          <p className="text-center text-sub dark:text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
            {phase === 'credentials' ? 'Credentials Identity Phase' : 'Biometric Verification Phase'}
          </p>

          <AnimatePresence mode="wait">
            {phase === 'credentials' ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerifyCredentials} 
                className="space-y-6"
              >
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-sub/50 group-focus-within:text-[#005DAB] transition-colors" />
                  <input type="email" placeholder="Email Identifier" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-16 pr-6 py-5 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border border-transparent dark:border-white/10 outline-none text-lead dark:text-white placeholder:text-sub/50 font-bold transition-all focus:ring-4 focus:ring-[#005DAB]/5 focus:border-[#005DAB] dark:focus:border-[#5AC8FA]" required />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-sub/50 group-focus-within:text-[#005DAB] transition-colors" />
                  <input type="password" placeholder="Access Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-16 pr-6 py-5 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border border-transparent dark:border-white/10 outline-none text-lead dark:text-white placeholder:text-sub/50 font-bold transition-all focus:ring-4 focus:ring-[#005DAB]/5 focus:border-[#005DAB] dark:focus:border-[#5AC8FA]" required />
                </div>
                <button type="submit" disabled={loading} className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#005DAB] to-[#007AFF] text-white font-bold uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-[#005DAB]/25 hover:shadow-[#005DAB]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50">
                  {loading ? 'Validating...' : 'Initiate Secure Login'}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="face"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="p-4 rounded-2xl bg-[#E8F1F9] dark:bg-blue-500/10 border border-[#005DAB]/20 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#005DAB] flex items-center justify-center text-white font-bold uppercase">
                    {preAuthUser?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-sub uppercase tracking-widest leading-none mb-1">Authenticated Identity</p>
                    <p className="text-sm font-bold text-[#005DAB] dark:text-[#5AC8FA] tracking-tight">{preAuthUser?.name}</p>
                  </div>
                </div>
                <FaceScanner mode="verify" targetSamples={1} onCapture={handleFaceLogin} autoStart={true} isLoading={loading} />
                <button onClick={() => setPhase('credentials')} className="w-full py-2 text-sub font-bold text-[10px] uppercase tracking-widest hover:text-[#FF3B30] transition-colors">
                  Reset Session
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
