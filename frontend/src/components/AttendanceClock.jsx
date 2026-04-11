import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  MapPin, 
  Building2, 
  Home, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  LogOut, 
  Coffee 
} from 'lucide-react';
import ShiftSelectionModal from './ShiftSelectionModal';

const AttendanceClock = ({ attendance, onCheckIn, onCheckOut, onStartBreak, onEndBreak, loading }) => {
  const [time, setTime] = useState(new Date());
  const [mode, setMode] = useState('office');
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState(null);
  const [showShiftModal, setShowShiftModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGPSLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported");
      return;
    }
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setLocError("Permission denied or GPS off"),
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    getGPSLocation();
  }, [mode]);

  const activeBreak = attendance?.breaks?.find(b => !b.end);
  const breakCounts = {
    '15m': attendance?.breaks?.filter(b => b.type === '15m').length || 0,
    '30m': attendance?.breaks?.filter(b => b.type === '30m').length || 0
  };

  const getRemainingSeconds = () => {
    if (!activeBreak) return 0;
    const start = new Date(activeBreak.start).getTime();
    const now = time.getTime();
    const elapsed = Math.floor((now - start) / 1000);
    const limit = activeBreak.type === '15m' ? 900 : 1800;
    return Math.max(0, limit - elapsed);
  };

  const formatSeconds = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const remaining = getRemainingSeconds();
  const isUrgent = activeBreak && remaining < 120;
  const checkInTime = attendance?.checkIn ? new Date(attendance.checkIn) : null;
  const isLate = checkInTime && (checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30));

  const finalizeCheckIn = (shift) => {
    setShowShiftModal(false);
    onCheckIn(mode, location, shift);
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 shadow-2xl border border-[#E5E5EA] dark:border-white/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-12 text-[#005DAB]/5 rotate-12 transform scale-150">
        <Clock className="w-64 h-64" />
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-4xl font-bold text-[#005DAB] dark:text-[#5AC8FA] uppercase tracking-tight ">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h3>
            <p className="text-sub dark:text-[#E5E7EB]/60 font-bold text-xs uppercase tracking-widest leading-none">
              {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {!attendance ? (
            <div className="space-y-6">
              <div className="flex p-1 bg-[#F2F2F7] dark:bg-white/5 rounded-3xl w-fit">
                <button
                  onClick={() => setMode('office')}
                  className={`flex items-center px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'office' ? 'bg-white dark:bg-[#111827] text-[#005DAB] dark:text-[#5AC8FA] shadow-sm' : 'text-sub'}`}
                >
                  <Building2 className="w-4 h-4 mr-2" /> Office
                </button>
                <button
                  onClick={() => setMode('online')}
                  className={`flex items-center px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'online' ? 'bg-white dark:bg-[#111827] text-[#005DAB] dark:text-[#5AC8FA] shadow-sm' : 'text-sub'}`}
                >
                  <Home className="w-4 h-4 mr-2" /> Online
                </button>
              </div>

              {mode === 'office' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-3xl border flex items-center gap-4 ${location ? 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20' : 'bg-[#FFD100]/10 border-[#FFD100]/20'}`}
                >
                  <div className={`p-2 rounded-xl transition-all ${location ? 'bg-green-500 text-white' : 'bg-[#FFD100] text-[#005DAB]'}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">GPS Accuracy</p>
                    <p className={`text-xs font-bold ${location ? 'text-green-600 dark:text-green-400' : 'text-sub'}`}>
                      {location ? `${mode === 'office' ? 'Office' : 'Online'} Coordinates Locked` : locError || 'Acquiring Location...'}
                    </p>
                  </div>
                </motion.div>
              )}

              <button
                onClick={() => setShowShiftModal(true)}
                disabled={loading || (mode === 'office' && !location)}
                className="w-full py-5 rounded-[1.5rem] bg-[#FFD100] text-[#005DAB] font-bold uppercase text-sm tracking-widest shadow-xl shadow-[#FFD100]/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <Play className="w-5 h-5 mr-3" /> Punch In
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 rounded-[2rem] bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center px-4 py-1.5 bg-[#005DAB] rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3 mr-2" /> Active Duty
                  </div>
                  {isLate && (
                    <div className="flex items-center px-4 py-1.5 bg-[#FFD100] rounded-full text-[#005DAB] text-[10px] font-bold uppercase tracking-widest">
                      <AlertTriangle className="w-3 h-3 mr-2" /> Late
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-bold text-sub uppercase tracking-widest leading-none mb-1">Check In</p>
                    <p className="text-sm font-bold text-[#005DAB] dark:text-[#5AC8FA]">
                      {new Date(attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-sub uppercase tracking-widest leading-none mb-1">Shift Mode</p>
                    <p className="text-sm font-bold text-[#005DAB] dark:text-[#5AC8FA] uppercase">
                      {attendance.mode} / {attendance.shift || 'day'}
                    </p>
                  </div>
                </div>
              </div>
              {!attendance.checkOut && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => onCheckOut({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                        () => onCheckOut(location)
                      );
                    } else {
                      onCheckOut(location);
                    }
                  }}
                  disabled={loading}
                  className="px-12 py-4 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#005DAB] to-[#007AFF] text-white font-bold uppercase text-xs tracking-[0.2em] shadow-lg shadow-[#005DAB]/20 hover:shadow-xl hover:shadow-[#005DAB]/30 transition-all disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5 mr-3" /> Punch Out
                </motion.button>
              )}
            </div>
          )}
        </div>

        {attendance && !attendance.checkOut && (
          <div className="bg-[#F2F2F7] dark:bg-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-[#005DAB] dark:text-[#5AC8FA] uppercase tracking-widest mb-6 flex items-center">
                <Coffee className="w-4 h-4 mr-3 text-[#FFD100]" /> Break Management
              </h4>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E5EA] dark:border-white/10">
                  <p className="text-[8px] font-bold text-sub uppercase tracking-widest mb-1">Short Breaks</p>
                  <p className="text-xl font-bold text-[#005DAB] dark:text-[#5AC8FA]">{breakCounts['15m']}/2</p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E5EA] dark:border-white/10">
                  <p className="text-[8px] font-bold text-sub uppercase tracking-widest mb-1">Lunch Break</p>
                  <p className="text-xl font-bold text-[#005DAB] dark:text-[#5AC8FA]">{breakCounts['30m']}/1</p>
                </div>
              </div>

              {activeBreak ? (
                <div className="space-y-4">
                  <div className="py-6 text-center bg-white dark:bg-[#111827] rounded-[2rem] border-2 border-dashed border-[#E5E5EA] dark:border-white/10 relative overflow-hidden group">
                    <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity ${isUrgent ? 'bg-[#FF3B30]' : 'bg-[#005DAB]'}`} />
                    <p className="text-[10px] font-bold text-sub uppercase tracking-[0.2em] mb-2">Active {activeBreak.type} Break</p>
                    <h4 className={`text-5xl font-bold tabular-nums tracking-tight ${isUrgent ? 'text-[#FF3B30] animate-pulse' : 'text-[#005DAB] dark:text-[#5AC8FA]'}`}>
                      {remaining > 0 ? formatSeconds(remaining) : "00:00"}
                    </h4>
                  </div>
                  <button
                    onClick={onEndBreak}
                    className="w-full py-5 rounded-[1.5rem] bg-[#005DAB] text-white font-bold uppercase text-sm tracking-widest transition-all shadow-lg shadow-[#005DAB]/20 hover:scale-[1.02] active:scale-95"
                  >
                    Resume Work
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {breakCounts['15m'] < 2 && (
                    <button
                      onClick={() => onStartBreak('15m')}
                      className="w-full py-4 rounded-2xl border-2 border-[#E5E5EA] dark:border-white/10 text-[#005DAB] dark:text-[#5AC8FA] font-bold uppercase text-[10px] tracking-widest hover:border-[#FFD100] hover:bg-[#FFD100]/5 transition-all"
                    >
                      Start 15m Break
                    </button>
                  )}
                  {breakCounts['30m'] < 1 && (
                    <button
                      onClick={() => onStartBreak('30m')}
                      className="w-full py-4 rounded-2xl border-2 border-[#E5E5EA] dark:border-white/10 text-[#005DAB] dark:text-[#5AC8FA] font-bold uppercase text-[10px] tracking-widest hover:border-[#FFD100] hover:bg-[#FFD100]/5 transition-all"
                    >
                      Start 30m Lunch
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-[#E5E5EA] dark:border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-sub uppercase tracking-widest">Total Break Time</span>
                <span className="text-sm font-bold text-[#005DAB] dark:text-[#5AC8FA]">{attendance.totalBreakTime} mins</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <ShiftSelectionModal 
        isOpen={showShiftModal} 
        onClose={() => setShowShiftModal(false)} 
        onSelect={finalizeCheckIn} 
      />
    </div>
  );
};

export default AttendanceClock;
