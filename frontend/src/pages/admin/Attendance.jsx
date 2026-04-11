import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  Download,
  ExternalLink,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  History
} from 'lucide-react';
import AgentPerformancePulse from '../../components/AgentPerformancePulse';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ModernDatePicker from '../../components/ModernDatePicker';

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter]);

  const today = new Date().toISOString().split('T')[0];
  const selectedDate = dateFilter || today;

  const fetchSellers = async () => {
    try {
      const { data } = await axios.get('/api/admin/sellers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSellers(data);
    } catch (err) {
      console.error('Failed to fetch sellers');
    }
  };

  const fetchAttendance = async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/attendance', {
        params: { date: selectedDate },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAttendance(data || []);
    } catch (err) {
      console.error('Attendance fetch error:', err);
      if (err.response?.status === 429) {
        toast.error('System is busy. Please try again later.');
      } else if (err.response?.status !== 404) {
        toast.error('Failed to sync with attendance registry.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    const presentIds = attendance.map(l => l.sellerId?._id?.toString());
    
    if (filter === 'all') {
      const absentData = sellers
        .filter(s => !presentIds.includes(s._id?.toString()))
        .map(s => ({ _id: `absent-${s._id}`, sellerId: s, date: selectedDate, status: 'absent' }));
      return [...attendance, ...absentData];
    }
    
    if (filter === 'present') return attendance;
    
    if (filter === 'absent') {
      return sellers
        .filter(s => !presentIds.includes(s._id?.toString()))
        .map(s => ({ _id: `absent-${s._id}`, sellerId: s, date: selectedDate, status: 'absent' }));
    }
    return attendance;
  };

  const filteredData = getFilteredData();

  const aggregateStats = {
    total: sellers.length,
    present: attendance.length,
    absent: sellers.length - attendance.length,
    late: attendance.filter(r => r.isLate).length,
    percentage: sellers.length ? Math.round((attendance.length / sellers.length) * 100) : 0
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight ">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Attendance</span> <span className="text-[#FFD100]">Registry</span>
          </h2>
          <p className="text-sub dark:text-[#E5E7EB]/60 font-medium text-xs uppercase tracking-widest mt-1">
            Real-time monitoring of agent activity and shifts
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-[#111827] px-6 py-3 rounded-2xl border border-[#E5E5EA] dark:border-white/10 shadow-sm text-[10px] font-bold uppercase tracking-widest text-lead dark:text-[#E5E7EB] flex items-center hover:bg-[#F2F2F7] transition-all">
            <Download className="w-4 h-4 mr-2" /> Export Data
          </button>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Workforce', value: aggregateStats.total, icon: Users, color: '#005DAB' },
          { label: 'Present Today', value: aggregateStats.present, icon: UserCheck, color: '#34C759', sub: `${aggregateStats.percentage}% active` },
          { label: 'Absent Registry', value: aggregateStats.absent, icon: UserX, color: '#FF3B30' },
          { label: 'Latency Pulse', value: aggregateStats.late, icon: AlertTriangle, color: '#FFD100', sub: 'Post 09:30 AM' }
        ].map((stat, i) => (
          <motion.div key={i} whileHover={{ y: -5 }} className="bg-white dark:bg-[#111827] p-8 rounded-[2.5rem] border border-[#E5E5EA] dark:border-white/10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-16 h-16" />
            </div>
            <p className="text-[10px] font-bold text-sub uppercase tracking-widest mb-2 flex items-center">
              <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: stat.color }} /> {stat.label}
            </p>
            <h3 className="text-3xl font-bold text-lead dark:text-[#E5E7EB] tracking-tight">{stat.value}</h3>
            {stat.sub && <p className="text-[8px] font-bold text-sub uppercase tracking-widest mt-1 opacity-60">{stat.sub}</p>}
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#111827] p-8 rounded-[2.5rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-1">
            <ModernDatePicker value={dateFilter} onChange={setDateFilter} label="Registry Audit Date" />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <div className="flex p-1 bg-[#F2F2F7] dark:bg-[#0B1120] rounded-2xl border border-[#E5E5EA] dark:border-white/10">
              {['all', 'present', 'absent'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    filter === f 
                      ? 'bg-white dark:bg-white/10 text-[#005DAB] dark:text-[#5AC8FA] shadow-sm' 
                      : 'text-sub'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-[3rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9F9FB] dark:bg-[#0B1120] border-b border-[#E5E5EA] dark:border-white/5">
                <th className="px-8 py-6 text-[10px] font-bold text-sub uppercase tracking-widest text-left">Agent Identity</th>
                <th className="px-8 py-6 text-[10px] font-bold text-sub uppercase tracking-widest text-left">Temporal Shift</th>
                <th className="px-8 py-6 text-[10px] font-bold text-sub uppercase tracking-widest text-left">Operational Mode</th>
                <th className="px-8 py-6 text-[10px] font-bold text-sub uppercase tracking-widest text-right">Protocol Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA] dark:divide-white/5">
              <AnimatePresence>
                {loading ? (
                  <tr><td colSpan="4" className="py-24 text-center">
                    <div className="w-8 h-8 border-4 border-[#005DAB]/20 border-t-[#005DAB] rounded-full animate-spin mx-auto" />
                  </td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan="4" className="py-24 text-center text-sub uppercase tracking-widest text-[10px] font-bold">No active registry entries found</td></tr>
                ) : (
                  filteredData.map((record) => (
                    <motion.tr key={record._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-[#F2F2F7]/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold relative ${record.status === 'absent' ? 'bg-red-50 text-red-500' : 'bg-[#005DAB]/10 text-[#005DAB]'}`}>
                            {record.sellerId?.name?.[0]}
                            {record.isLate && <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFD100] border-2 border-white dark:border-[#111827] rounded-full" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight">{record.sellerId?.name}</p>
                            <p className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">{record.sellerId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {record.status === 'absent' ? (
                          <span className="px-3 py-1 bg-red-50 dark:bg-red-900/10 text-[9px] font-bold uppercase text-red-500 tracking-widest rounded-full border border-red-100 dark:border-red-900/20">Absent Registry</span>
                        ) : (
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${record.isLate ? 'text-[#FFD100]' : 'text-lead dark:text-[#E5E7EB]'}`}>
                              {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[8px] font-bold text-sub uppercase tracking-widest mt-0.5">Checked In</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-[#F2F2F7] dark:bg-[#0B1120] text-[9px] font-bold text-sub uppercase tracking-widest rounded-full border border-[#E5E5EA] dark:border-white/10">
                          {record.status === 'absent' ? '---' : record.mode || 'OFFICE'}
                        </span>
                        {record.checkInLocation?.lat && (
                          <a href={`https://www.google.com/maps?q=${record.checkInLocation.lat},${record.checkInLocation.lng}`} target="_blank" rel="noreferrer" className="p-2 bg-white dark:bg-[#111827] text-sub hover:text-[#005DAB] rounded-xl border border-[#E5E5EA] dark:border-white/10 shadow-sm transition-all group-hover:scale-110">
                            <MapPin className="w-3.5 h-3.5" />
                          </a>
                        )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => { setSelectedAgent(record.sellerId); setShowPulse(true); }}
                          className="px-5 py-2.5 bg-white dark:bg-[#111827] hover:bg-[#005DAB] hover:text-white dark:hover:bg-[#5AC8FA] dark:hover:text-black text-[10px] font-bold uppercase tracking-widest text-[#005DAB] dark:text-[#5AC8FA] border border-[#005DAB]/20 dark:border-[#5AC8FA]/20 rounded-xl transition-all flex items-center gap-2 ml-auto shadow-sm"
                        >
                          <History className="w-3.5 h-3.5" /> Performance Pulse
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AgentPerformancePulse 
        isOpen={showPulse}
        onClose={() => setShowPulse(false)}
        agent={selectedAgent}
      />
    </div>
  );
};

export default AdminAttendance;
