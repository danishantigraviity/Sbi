import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { loginSuccess } from '../slices/authSlice';
import { Mail, Lock, UserCheck, ShieldCheck, Sun, Moon } from 'lucide-react';
import FaceScanner from '../components/FaceScanner';

const Login = ({ toggleTheme, isDark, forcedRole = null }) => {
  const [role, setRole] = useState(forcedRole || 'admin');
  const [email, setEmail] = useState('admin@redbank.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isFallback, setIsFallback] = useState(true);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Auto-fill admin credentials when role is admin
  React.useEffect(() => {
    if (role === 'admin') {
      setEmail('admin@redbank.com');
      setPassword('admin123');
    }
  }, [role]);

  const getCoordinates = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: null, lng: null });
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: null, lng: null })
      );
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const coords = await getCoordinates();
    try {
      const { data } = await axios.post('/api/auth/login', { email, password, role, ...coords });
      dispatch(loginSuccess(data));
      navigate(role === 'admin' ? '/admin/dashboard' : '/seller/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.data?.type === 'NO_ENROLLMENT') {
        toast.error(err.response.data.message, { 
          icon: '🔓', 
          duration: 5000,
          style: { background: '#F2F2F7', color: '#005DAB', borderRadius: '1rem', fontWeight: 'bold', border: '1px solid #005DAB33' }
        });
      } else {
        toast.error(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLogin = async (images) => {
    setLoading(true);
    const coords = await getCoordinates();
    try {
      const { data } = await axios.post('/api/auth/face-login', { role, images, ...coords });
      dispatch(loginSuccess(data));
      navigate(role === 'admin' ? '/admin/dashboard' : '/seller/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.data?.type === 'NO_ENROLLMENT') {
        toast.error(err.response.data.message, { 
          icon: '🔓', 
          duration: 5000,
          style: { background: '#F2F2F7', color: '#005DAB', borderRadius: '1rem', fontWeight: 'bold', border: '1px solid #005DAB33' }
        });
        setIsFallback(true);
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        if (newAttempts >= 3) {
          setIsFallback(true);
        } else {
          toast.error(`Recognition failed (${newAttempts}/3)`);
        }
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
            {role === 'admin' ? 'Admin Terminal' : 'Agent Portal'}
          </h2>

          <div className="relative flex bg-[#F2F2F7] dark:bg-[#0B1120] p-1.5 rounded-2xl mb-8 border border-[#E5E5EA] dark:border-white/10">
            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-[#111827] rounded-xl shadow-lg transition-all duration-300 ease-out ${role === 'admin' ? 'left-[calc(50%+3px)]' : 'left-1.5'}`} />
            <button onClick={() => setRole('seller')} className={`relative flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 z-10 ${role === 'seller' ? 'text-[#005DAB] dark:text-[#5AC8FA]' : 'text-sub'}`}>
              Seller
            </button>
            <button onClick={() => setRole('admin')} className={`relative flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 z-10 ${role === 'admin' ? 'text-[#005DAB] dark:text-[#5AC8FA]' : 'text-sub'}`}>
              Admin
            </button>
          </div>

          {!isFallback ? (
            <div className="space-y-8">
              <FaceScanner mode="verify" targetSamples={1} onCapture={handleFaceLogin} autoStart={true} />
              <button onClick={() => setIsFallback(true)} className="w-full py-4 text-sub font-bold text-xs uppercase tracking-widest">Manual Authentication</button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border border-transparent dark:border-white/10 outline-none text-lead dark:text-white placeholder:text-sub/50 font-bold transition-all focus:ring-4 focus:ring-[#005DAB]/5 focus:border-[#005DAB] dark:focus:border-[#5AC8FA]" required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border border-transparent dark:border-white/10 outline-none text-lead dark:text-white placeholder:text-sub/50 font-bold transition-all focus:ring-4 focus:ring-[#005DAB]/5 focus:border-[#005DAB] dark:focus:border-[#5AC8FA]" required />
              <button type="submit" className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#005DAB] to-[#007AFF] text-white font-bold uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-[#005DAB]/25 hover:shadow-[#005DAB]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">Authenticate</button>
              <button type="button" onClick={() => setIsFallback(false)} className="w-full py-2 text-sub font-bold text-xs">Biometric Scan</button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
