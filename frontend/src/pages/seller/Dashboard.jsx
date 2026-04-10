import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  PhoneCall, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  UserPlus, 
  ClipboardList, 
  ShieldCheck, 
  X,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ShiftSelectionModal from '../../components/ShiftSelectionModal';
import { useSelector, useDispatch } from 'react-redux';
import { setWorkMode } from '../../slices/authSlice';

const SellerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [stats, setStats] = useState({
    totalCalls: 0,
    convertedLeads: 0,
    cardSales: 0,
    attendance: 'Not Checked In'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workStatus, setWorkStatus] = useState({
    workMode: 'idle',
    activeSession: null,
    pendingRequest: null
  });
  const [timer, setTimer] = useState(0);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [requestDuration, setRequestDuration] = useState('2');
  const [requestLoading, setRequestLoading] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [currentLoc, setCurrentLoc] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null);
        const { data } = await axios.get('/api/seller/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (data) {
          setStats(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Connection to server lost. Showing offline data.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
      fetchWorkStatus();
    }
  }, [user]);

  useEffect(() => {
    let interval;
    if (workStatus.activeSession && workStatus.activeSession.startTime) {
      const start = new Date(workStatus.activeSession.startTime).getTime();
      interval = setInterval(() => {
        const now = new Date().getTime();
        setTimer(Math.floor((now - start) / 1000));
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [workStatus.activeSession]);

  const fetchWorkStatus = async () => {
    try {
      const { data } = await axios.get('/api/work/status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWorkStatus(data);
      dispatch(setWorkMode(data.workMode));
    } catch (err) {
      console.error('Failed to fetch work status');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-vh-100">
        <div className="w-12 h-12 border-4 border-[#005DAB]/20 border-t-[#005DAB] rounded-full animate-spin" />
      </div>
    );
  }

  const handleCheckIn = async (shift) => {
    try {
      const { data } = await axios.post('/api/seller/checkin', {
        mode: 'office',
        shift,
        lat: currentLoc?.lat || 12.5425,
        lng: currentLoc?.lng || 78.2336
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(prev => ({ ...prev, attendance: data }));
      toast.success('Check-in Successful');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in Failed');
    }
  };

  const triggerCheckIn = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setShowShiftModal(true);
      },
      () => {
        toast.error("Location permission required");
      }
    );
  };

  const handleModeSwitch = async (targetMode) => {
    if (targetMode === 'company') {
      try {
        const { data } = await axios.post('/api/work/start', {
          mode: 'company', lat: 12.5425, lng: 78.2336
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setWorkStatus(prev => ({ ...prev, workMode: 'company', activeSession: data.workLog }));
        dispatch(setWorkMode('company'));
        toast.success('Company duty started');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to start session');
      }
    } else {
      setShowRequestModal(true);
    }
  };

  const handleSubmitRequest = async () => {
    if (requestLoading) return;
    if (!requestReason) return toast.error('Reason is required');
    setRequestLoading(true);
    try {
      const { data } = await axios.post('/api/work/start', {
        mode: 'personal',
        reason: requestReason,
        duration: parseInt(requestDuration),
        lat: 12.5425,
        lng: 78.2336
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWorkStatus(prev => ({ ...prev, pendingRequest: data.workLog }));
      setShowRequestModal(false);
      setRequestReason('');
      toast.success('Request sent to admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleStopSession = async () => {
    try {
      await axios.post('/api/work/stop', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWorkStatus({ workMode: 'idle', activeSession: null, pendingRequest: null });
      dispatch(setWorkMode('idle'));
      toast.success('Session terminated');
    } catch (err) {
      toast.error('Failed to stop session');
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight ">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Agent</span>{" "}
            <span className="text-[#FFD100]">Dashboard</span>
          </h2>
          <p className="text-sub dark:text-[#E5E7EB]/60 font-medium text-xs uppercase tracking-widest mt-1">
            Real-time performance metrics and synchronization
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {workStatus.workMode === 'idle' && !workStatus.pendingRequest ? (
            <div className="flex p-1 bg-[#F2F2F7] dark:bg-[#0B1120] rounded-2xl border border-[#E5E5EA] dark:border-white/10">
              <button onClick={() => handleModeSwitch('company')} className="px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-sub transition-all">Go Company</button>
              <button onClick={() => handleModeSwitch('personal')} className="px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-sub transition-all">Personal Req</button>
            </div>
          ) : workStatus.pendingRequest ? (
            <div className="px-6 py-3 rounded-2xl bg-[#FFD100]/10 border border-[#FFD100]/20 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#FFD100] animate-pulse" />
              <span className="text-[10px] font-bold text-[#FFD100] uppercase tracking-widest text-xs">Awaiting Admin...</span>
              <button onClick={handleStopSession} className="text-[9px] font-bold text-red-500 uppercase underline ml-2">Cancel</button>
            </div>
          ) : (
            <div className={`px-6 py-3 rounded-2xl border flex items-center gap-4 ${workStatus.workMode === 'company' ? 'bg-[#34C759]/10 border-[#34C759]/20' : 'bg-[#FF3B30]/10 border-[#FF3B30]/20'}`}>
              <div className="flex flex-col">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${workStatus.workMode === 'company' ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                  {workStatus.workMode === 'company' ? 'Company Duty' : 'Personal Work'}
                </span>
                <span className="text-[9px] font-bold text-sub uppercase tabular-nums">{formatTime(timer)}</span>
              </div>
              <button onClick={handleStopSession} className="p-2 rounded-lg bg-white dark:bg-[#111827] text-lead hover:text-red-50 transition-colors shadow-sm">
                <TrendingUp className="w-4 h-4 rotate-180" />
              </button>
            </div>
          )}

          <div className="bg-white dark:bg-[#111827] px-5 py-3 rounded-2xl border border-[#E5E5EA] dark:border-white/10 flex items-center shadow-sm">
            <Clock className="w-5 h-5 text-sub mr-3" />
            <span className="text-sm font-bold text-lead uppercase tracking-tight">
              {typeof stats?.attendance === 'object' && stats?.attendance !== null
                ? stats.attendance.checkOut ? 'Checked Out' : 'On Duty'
                : stats?.attendance || 'Not Checked In'}
            </span>
          </div>

          <button onClick={triggerCheckIn} className="px-8 py-3.5 rounded-2xl bg-[#FFD100] text-[#005DAB] font-bold uppercase text-xs tracking-widest shadow-xl shadow-[#FFD100]/20 hover:scale-105 active:scale-95 transition-all">
            Check In
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !requestLoading && setShowRequestModal(false)} />
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="relative bg-white dark:bg-[#111827] p-10 rounded-[3rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl max-w-xl w-full">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#005DAB] to-[#007AFF]" />
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-3xl font-bold uppercase tracking-tight flex items-center">
                  <ShieldCheck className="w-8 h-8 mr-4 text-[#005DAB]" />
                  <span className="text-[#005DAB]">Request</span>{" "}
                  <span className="text-[#FFD100]">Permission</span>
                </h3>
                <button onClick={() => setShowRequestModal(false)} className="p-2 hover:bg-red-50 rounded-full text-sub"><X /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-lead uppercase tracking-widest ml-1 mb-2 block">Operational Justification</label>
                  <textarea value={requestReason} onChange={(e) => setRequestReason(e.target.value)} placeholder="Provide reason..." className="w-full p-6 rounded-3xl bg-[#F2F2F7] dark:bg-[#0B1120] border-none outline-none focus:ring-2 focus:ring-[#005DAB] text-xs font-bold min-h-[120px]" />
                </div>
                <button onClick={handleSubmitRequest} disabled={requestLoading} className="w-full py-5 rounded-2xl bg-[#005DAB] text-white font-bold uppercase text-xs tracking-[0.2em] shadow-2xl shadow-[#005DAB]/20 hover:scale-[1.02] active:scale-95 transition-all">
                  {requestLoading ? 'Transmitting...' : 'Transmit Request'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: PhoneCall, label: 'Total Calls Logged', value: stats.totalCalls, color: '#005DAB' },
          { icon: CheckCircle2, label: 'Leads Converted', value: stats.convertedLeads, color: '#34C759' },
          { icon: CreditCard, label: 'Credit Cards Sold', value: stats.cardSales, color: '#005DAB' }
        ].map((item, i) => (
          <motion.div key={i} whileHover={{ y: -5 }} className="bg-white dark:bg-[#111827] p-8 rounded-[2.5rem] border border-[#E5E5EA] dark:border-white/10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <item.icon className="w-20 h-20 text-[#005DAB]" />
            </div>
            <p className="text-sub dark:text-[#E5E7EB]/40 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2`} style={{ backgroundColor: item.color }}></span> {item.label}
            </p>
            <h3 className="text-4xl font-bold text-lead dark:text-[#E5E7EB] tracking-tight">{item.value ?? 0}</h3>
          </motion.div>
        ))}
      </div>

      <ShiftSelectionModal 
        isOpen={showShiftModal} 
        onClose={() => setShowShiftModal(false)} 
        onSelect={(shift) => {
          setShowShiftModal(false);
          handleCheckIn(shift);
        }} 
      />
    </div>
  );
};

export default SellerDashboard;
