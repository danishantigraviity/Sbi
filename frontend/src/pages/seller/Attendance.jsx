import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import AttendanceClock from '../../components/AttendanceClock';
import ModernDatePicker from '../../components/ModernDatePicker';
import ShiftSelectionModal from '../../components/ShiftSelectionModal';
import {
  History,
  MapPin,
  Building2,
  Home,
  Coffee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sun,
  Moon,
  Target,
  PhoneOutgoing,
  Calendar
} from 'lucide-react';

const SellerAttendance = () => {
  const [attendance, setAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [currentLoc, setCurrentLoc] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchStatus();
    fetchHistory();
  }, []);

  const fetchStatus = async () => {
    try {
      const { data } = await axios.get('/api/seller/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAttendance(data.attendance || null);
    } catch (err) {
      console.error('Failed to fetch attendance status');
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get('/api/seller/attendance-history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch attendance history');
    }
  };

  const handleCheckIn = async (mode, loc, shift) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/seller/checkin', {
        mode,
        shift,
        lat: loc?.lat,
        lng: loc?.lng
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAttendance(data);
      fetchHistory();
      toast.success(`Punched in for ${shift} shift via ${mode}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
      setShowShiftModal(false);
    }
  };

  const handleCheckOut = async (loc) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/seller/checkout', {
        lat: loc?.lat,
        lng: loc?.lng
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAttendance(data);
      fetchHistory();
      toast.success('Punched out successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStartBreak = async (type) => {
    try {
      const { data } = await axios.post('/api/seller/start-break', { breakType: type }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAttendance(data);
      toast.success(`Starting ${type} break`);
    } catch (err) {
      toast.error('Failed to start break');
    }
  };

  const handleEndBreak = async () => {
    try {
      const { data } = await axios.post('/api/seller/end-break', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAttendance(data);
      toast.success('Break ended');
    } catch (err) {
      toast.error('Failed to end break');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight ">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Duty</span>{" "}
            <span className="text-[#FFD100]">Station</span>
          </h2>
          <p className="text-sub dark:text-[#E5E7EB]/60 font-medium text-xs uppercase tracking-widest mt-1">
            Operational synchronization and peripheral shift management
          </p>
        </div>
      </div>

      <AttendanceClock
        attendance={attendance}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onStartBreak={handleStartBreak}
        onEndBreak={handleEndBreak}
        loading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Ledger / Manual Marking */}
        <div className="lg:col-span-1 bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 border border-[#E5E5EA] dark:border-white/10 shadow-xl self-start">
          <h3 className="text-sm font-bold text-[#005DAB] dark:text-[#5AC8FA] uppercase tracking-widest mb-6 flex items-center ">
            <Calendar className="w-4 h-4 mr-3 text-[#FFD100]" /> Daily Protocol
          </h3>
          <div className="space-y-6">
            <ModernDatePicker 
              label="Select Date to Mark" 
              value={attendance ? today : ''} 
              onChange={(val) => {
                if (val === today && !attendance) {
                  // Capture location before opening modal
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setCurrentLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                      setShowShiftModal(true);
                    },
                    () => {
                      toast.error("Location permission required to mark attendance.");
                    }
                  );
                }
              }}
              minDate={today}
              maxDate={today}
              highlightData={(() => {
                const data = {};
                // Helper to format date consistent with backend
                const fmt = (d) => d.toISOString().split('T')[0];
                
                // Past 30 days logic
                for (let i = 1; i <= 30; i++) {
                  const d = new Date();
                  d.setDate(d.getDate() - i);
                  data[fmt(d)] = 'absent';
                }
                
                // Overlay actual history
                history.forEach(h => {
                  data[h.date] = 'present';
                });

                // Today's status
                if (attendance) data[today] = 'present';
                
                return data;
              })()}
            />
            <div className="p-4 rounded-2xl bg-[#F9F9FB] dark:bg-white/5 border border-dashed border-[#E5E5EA]">
              <p className="text-[9px] font-bold text-sub uppercase tracking-widest leading-relaxed">
                <AlertTriangle className="w-3 h-3 inline mr-1 text-[#FFD100]" />
                Selection restricted to current operational cycle. Past logs are read-only for audit integrity.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-[2.5rem] p-10 border border-[#E5E5EA] dark:border-white/10 shadow-2xl">
          <h3 className="text-xl font-bold text-[#005DAB] dark:text-[#5AC8FA] uppercase tracking-widest mb-8 flex items-center ">
            <History className="w-5 h-5 mr-4" /> Recent Activity Log
          </h3>

        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((record) => (
              <motion.div key={record._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-3xl bg-[#F9F9FB] dark:bg-[#0B1120] border border-[#E5E5EA] dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-8">
                  <div className="flex flex-col">
                    <p className="text-[8px] font-bold text-sub uppercase tracking-widest mb-1">Date</p>
                    <p className="text-sm font-bold text-lead uppercase tracking-tight ">{new Date(record.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col border-l border-[#E5E5EA] pl-8">
                    <p className="text-[8px] font-bold text-sub uppercase tracking-widest mb-1">Shift</p>
                    <p className="text-sm font-bold text-lead uppercase tracking-tight ">
                      {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {record.checkOut ? ` - ${new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ' (On Duty)'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <span className="px-3 py-1 bg-white dark:bg-[#111827] rounded-full text-[8px] font-bold uppercase tracking-widest text-[#005DAB] dark:text-[#5AC8FA] border border-[#E5E5EA] dark:border-white/10 shadow-sm flex items-center gap-2">
                    {record.shift === 'night' ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
                    {record.shift || 'day'}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#005DAB]">{record.mode}</span>
                  <p className="text-[10px] font-bold text-sub uppercase tracking-widest">{record.totalBreakTime}m breaks</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-[#E5E5EA] rounded-[2.5rem]">
            <p className="text-sub uppercase tracking-widest text-[10px] font-bold">No shift history found</p>
          </div>
        )}
        </div>
      </div>
      <ShiftSelectionModal 
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        onSelect={(shift) => {
          setShowShiftModal(false);
          handleCheckIn('office', currentLoc, shift);
        }}
      />
    </div>
  );
};

export default SellerAttendance;
