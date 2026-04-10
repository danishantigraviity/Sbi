import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PhoneOutgoing, Clock, CheckCircle2, AlertCircle, RefreshCw, TrendingUp, PhoneCall, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';

const CallDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const isPersonal = user?.workMode === 'personal';
  const [queue, setQueue] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const [queueRes, analyticsRes] = await Promise.all([
        axios.get('/api/crm/queue', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/crm/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setQueue(queueRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      // Don't show toast for auth errors as they are handled globally by the interceptor
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error('Failed to sync dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const COLORS = ['#005DAB', '#FFD100', '#34C759', '#1C1C1E', '#8E8E93'];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-[#34C759]" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-[#005DAB]" />;
      case 'calling': return <RefreshCw className="w-4 h-4 text-[#005DAB] animate-spin" />;
      default: return <Clock className="w-4 h-4 text-sub" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight ">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Autocall</span>{" "}
            <span className="text-[#FFD100]">Monitoring</span>
          </h2>
          <p className="text-sub dark:text-[#E5E7EB]/60 font-bold text-xs uppercase tracking-widest mt-1">Monitoring automated lead engagement campaigns</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading || isPersonal}
          className={`flex items-center px-6 py-3 rounded-2xl bg-white dark:bg-[#111827] text-lead dark:text-[#E5E7EB] font-bold uppercase text-[10px] tracking-widest border border-[#E5E5EA] dark:border-white/10 shadow-sm transition-all ${isPersonal ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F2F2F7] dark:hover:bg-white/5'}`}
        >
          <RefreshCw className={`w-4 h-4 mr-3 text-[#005DAB] dark:text-[#5AC8FA] ${loading ? 'animate-spin' : ''}`} />
          {isPersonal ? 'Actions Restricted' : 'Synchronize Data'}
        </button>
      </div>

      <AnimatePresence>
        {isPersonal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-[#FF3B30]/5 border-2 border-dashed border-[#FF3B30]/20 p-10 rounded-[3rem] text-center"
          >
            <div className="w-20 h-20 bg-[#FF3B30]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-[#FF3B30]" />
            </div>
            <h3 className="text-2xl font-bold text-[#FF3B30] uppercase tracking-tight ">Personal Mode Active</h3>
            <p className="text-sub text-xs font-bold uppercase tracking-widest mt-2 max-w-md mx-auto leading-relaxed">
              All operational engagement systems (Autocall / CRM) are disabled while you are in Personal Work mode. Please switch back to Company Duty to resume operations.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!isPersonal && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#111827] p-6 rounded-[2.5rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#005DAB]/10 rounded-xl transition-transform group-hover:scale-110">
                    <PhoneCall className="w-6 h-6 text-[#005DAB]" />
                  </div>
                  <span className="text-[10px] font-bold text-sub uppercase tracking-widest">Total Attempts</span>
                </div>
                <h4 className="text-4xl font-bold text-lead dark:text-[#E5E7EB] tracking-tight ">{analytics?.totalCalls || 0}</h4>
                <p className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest mt-2">Historical Volume</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#111827] p-6 rounded-[2.5rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#34C759]/10 rounded-xl transition-transform group-hover:scale-110">
                    <TrendingUp className="w-6 h-6 text-[#34C759]" />
                  </div>
                  <span className="text-[10px] font-bold text-sub uppercase tracking-widest">Efficiency</span>
                </div>
                <h4 className="text-4xl font-bold text-[#34C759] tracking-tight ">{analytics?.successRate || 0}%</h4>
                <p className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest mt-2">Conversion Ratio</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#005DAB] dark:bg-[#007AFF]/90 p-6 rounded-[2.5rem] text-white shadow-xl shadow-[#005DAB]/20 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl transition-transform group-hover:scale-110">
                    <Activity className="w-6 h-6 text-[#FFD100]" />
                  </div>
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">System Status</span>
                </div>
                <h4 className="text-4xl font-bold text-white uppercase tracking-tight ">Active</h4>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-2">Dialer operational</p>
              </motion.div>
            </div>

            <div className="bg-white dark:bg-[#111827] p-6 rounded-[2.5rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl h-full">
              <h3 className="text-[10px] font-bold text-[#005DAB] dark:text-[#5AC8FA] uppercase tracking-widest mb-6">Outcome Distribution</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.distribution || [{ _id: 'None', count: 1 }]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="_id"
                    >
                      {(analytics?.distribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                {(analytics?.distribution || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[9px] uppercase font-bold text-sub dark:text-[#E5E7EB]/40 tracking-tight">{item._id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <div className="bg-white dark:bg-[#111827] rounded-[3rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-[#E5E5EA] dark:border-white/10 flex items-center justify-between bg-[#F9F9FB] dark:bg-[#0B1120]">
                <h3 className="text-xl font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-[#005DAB] dark:text-[#5AC8FA]" /> Live Call Queue
                </h3>
                <span className="bg-[#005DAB]/10 dark:bg-[#005DAB]/20 text-[#005DAB] dark:text-[#5AC8FA] text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                  Operational Activity Log
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white dark:bg-[#111827]/50 text-left">
                      <th className="px-8 py-6 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">Lead Identity</th>
                      <th className="px-8 py-6 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">Destination</th>
                      <th className="px-8 py-6 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">Pulse Status</th>
                      <th className="px-8 py-6 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest text-right">Attempts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5EA] dark:divide-white/5 bg-white dark:bg-[#111827]">
                    {queue.length > 0 ? queue.map((item) => (
                      <tr key={item._id} className="hover:bg-[#F2F2F7]/50 dark:hover:bg-white/5 transition-all group border-b border-[#E5E5EA] dark:border-white/5 last:border-0">
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="text-sm font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight">{item.leadId?.name || 'Unknown Entity'}</div>
                          <div className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">{item.leadId?.email}</div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm text-lead dark:text-[#E5E7EB] font-bold uppercase tracking-tight ">
                          {item.phoneNumber}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(item.status)}
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${
                              item.status === 'completed' ? 'text-[#34C759]' : item.status === 'failed' ? 'text-[#005DAB]' : item.status === 'calling' ? 'text-[#005DAB]' : 'text-sub'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-right text-[10px] font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-widest">
                          <span className="text-[#005DAB] dark:text-[#5AC8FA]">{item.attempts}</span> / <span className="text-sub dark:text-[#E5E7EB]/40">{item.maxRetries}</span> SYNC
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-8 py-24 text-center">
                          <div className="w-20 h-20 bg-[#F2F2F7] dark:bg-[#0B1120] rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-[#E5E5EA] dark:border-white/10 shadow-inner">
                            <PhoneOutgoing className="w-10 h-10 text-sub dark:text-[#E5E7EB]/20 opacity-30" />
                          </div>
                          <h3 className="text-xl font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight ">Queue Empty</h3>
                          <p className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest mt-2">{loading ? 'Synthesizing...' : 'Please upload leads to initiate dialer'}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CallDashboard;
