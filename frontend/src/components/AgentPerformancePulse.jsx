import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Sun, Moon, AlertCircle } from 'lucide-react';

const AgentPerformancePulse = ({ isOpen, onClose, agent }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && agent?._id) {
      fetchHistory();
    }
  }, [isOpen, agent]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/seller/${agent._id}/attendance`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch agent pulse');
    } finally {
      setLoading(false);
    }
  };

  const getDayStatus = (dateStr) => {
    const record = history.find(h => h.date === dateStr);
    if (!record) return 'absent';
    return 'present';
  };

  const generateDays = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const dayGrid = generateDays();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }} 
            animate={{ scale: 1, y: 0, opacity: 1 }} 
            exit={{ scale: 0.9, y: 20, opacity: 0 }} 
            className="relative bg-white dark:bg-[#111827] w-full max-w-4xl rounded-[3rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#005DAB] to-[#FFD100]" />
            
            <div className="p-10">
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#005DAB]/10 flex items-center justify-center text-2xl font-bold text-[#005DAB]">
                    {agent?.name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold uppercase tracking-tight ">
                      <span className="text-[#005DAB] dark:text-[#5AC8FA]">{agent?.name}</span>
                    </h3>
                    <p className="text-sub font-bold text-xs uppercase tracking-widest mt-1">Performance Pulse Ledger</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-sub transition-colors">
                  <X />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-lead uppercase tracking-[0.2em] mb-6 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-[#005DAB]" /> 30-Day Protocol Sync
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {dayGrid.map((date) => {
                        const status = getDayStatus(date);
                        return (
                          <div 
                            key={date}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold border transition-all ${
                              status === 'present' 
                                ? 'bg-[#34C759]/10 border-[#34C759]/20 text-[#34C759] shadow-sm shadow-[#34C759]/10' 
                                : 'bg-[#FF3B30]/5 border-dashed border-[#FF3B30]/20 text-[#FF3B30]/40'
                            }`}
                            title={date}
                          >
                            {new Date(date).getDate()}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-[#F9F9FB] dark:bg-[#0B1120] rounded-3xl border border-[#E5E5EA] dark:border-white/5">
                      <p className="text-[10px] font-bold text-sub uppercase tracking-widest mb-1">Consistency</p>
                      <p className="text-2xl font-bold text-lead uppercase tracking-tight">
                        {Math.round((history.length / 30) * 100)}%
                      </p>
                    </div>
                    <div className="p-6 bg-[#F9F9FB] dark:bg-[#0B1120] rounded-3xl border border-[#E5E5EA] dark:border-white/5">
                      <p className="text-[10px] font-bold text-sub uppercase tracking-widest mb-1">Avg Break</p>
                      <p className="text-2xl font-bold text-lead uppercase tracking-tight">
                        {history.length ? Math.round(history.reduce((acc, curr) => acc + (curr.totalBreakTime || 0), 0) / history.length) : 0}m
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-lead uppercase tracking-[0.2em] mb-2">Recent Intervals</h4>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                      <p className="text-xs font-bold text-sub uppercase animate-pulse">Synchronizing records...</p>
                    ) : history.length === 0 ? (
                      <p className="text-xs font-bold text-sub uppercase">No active records found</p>
                    ) : history.map((rec) => (
                      <div key={rec._id} className="p-5 bg-white dark:bg-[#111827] rounded-3xl border border-[#E5E5EA] dark:border-white/10 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[9px] font-bold text-sub uppercase tracking-widest">
                            {new Date(rec.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {rec.shift === 'night' ? <Moon className="w-3 h-3 text-indigo-400" /> : <Sun className="w-3 h-3 text-amber-400" />}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-lead uppercase">
                              {new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-[8px] font-bold text-sub uppercase tracking-widest mt-1">{rec.mode || 'OFFICE'}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-bold text-[#005DAB] uppercase tracking-widest leading-none">CHECK-IN</p>
                             {rec.checkOut && (
                               <p className="text-[8px] font-bold text-sub uppercase tracking-widest mt-1">OUT: {new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                             )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AgentPerformancePulse;
