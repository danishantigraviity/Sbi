import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { 
  Clock, 
  Briefcase, 
  User, 
  Calendar, 
  History, 
  FileSpreadsheet, 
  Download, 
  Filter,
  X
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const WorkReports = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const [data, setData] = useState(null);
  const [manualReports, setManualReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/api/work/admin/report' : '/api/work/report';
      const { data } = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(data);
    } catch (err) {
      toast.error('Failed to sync report data');
    } finally {
      setLoading(false);
    }
  };

  const fetchManualReports = async () => {
    try {
      const { data } = await axios.get('/api/work/manual-reports', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setManualReports(data);
    } catch (err) {
      console.error('Failed to fetch manual reports');
    }
  };

  useEffect(() => {
    fetchReport();
    fetchManualReports();
  }, [isAdmin]);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportText) return toast.error('Report text is required');
    setSubmitting(true);
    const formData = new FormData();
    formData.append('text', reportText);
    if (reportFile) {
      formData.append('reportFile', reportFile);
    }
    try {
      await axios.post('/api/work/manual-report', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      toast.success('Work report transmitted successfully');
      setShowSubmitModal(false);
      setReportText('');
      setReportFile(null);
      fetchManualReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const summaryData = isAdmin ? [] : [
    { name: 'Company Duty', value: data?.summary?.totalCompanyMinutes || 0, color: '#005DAB' },
    { name: 'Personal Work', value: data?.summary?.totalPersonalMinutes || 0, color: '#FFD100' }
  ];

  const formatMinutes = (min) => {
    const hrs = Math.floor(min / 60);
    const m = min % 60;
    return `${hrs}h ${m}m`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight ">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Hour</span>{" "}
            <span className="text-[#FFD100]">Oversight</span>
          </h2>
          <p className="text-sub dark:text-[#E5E7EB]/60 font-bold text-xs uppercase tracking-widest mt-1">
            {isAdmin ? 'Global synchronization of staff shift allocation' : 'Personal chronological duty analytics'}
          </p>
        </div>
        <div className="flex gap-4">
          {!isAdmin && (
            <button onClick={() => setShowSubmitModal(true)} className="flex items-center px-6 py-3 rounded-2xl bg-[#FFD100] text-[#005DAB] font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-[#FFD100]/20 hover:scale-105 transition-all">
              <FileSpreadsheet className="w-4 h-4 mr-3" /> Submit Formal Report
            </button>
          )}
          <button onClick={fetchReport} className="flex items-center px-6 py-3 rounded-2xl bg-white dark:bg-[#111827] text-lead dark:text-[#E5E7EB] font-bold uppercase text-[10px] tracking-widest border border-[#E5E5EA] dark:border-white/10 shadow-sm">
            <History className="w-4 h-4 mr-3 text-[#005DAB]" /> Refresh Feed
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !submitting && setShowSubmitModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-xl bg-white dark:bg-[#111827] rounded-[3rem] shadow-2xl p-10 overflow-hidden border dark:border-white/10">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#005DAB] to-[#FFD100]" />
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold uppercase tracking-tight">
                  <span className="text-[#005DAB] dark:text-[#5AC8FA]">Manual</span>{" "}
                  <span className="text-[#FFD100]">Work Report</span>
                </h3>
                <button onClick={() => setShowSubmitModal(false)} className="text-sub hover:text-[#005DAB]"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmitReport} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-sub uppercase tracking-widest ml-1">Narrative Summary</label>
                  <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="Summarize your work activities..." className="w-full h-40 p-6 rounded-3xl bg-[#F2F2F7] dark:bg-[#0B1120] border-none outline-none focus:ring-2 focus:ring-[#005DAB] text-xs font-bold shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-sub uppercase tracking-widest ml-1">Attachments (PDF/Word)</label>
                  <div className="relative group p-4 rounded-2xl bg-white dark:bg-[#111827] border-2 border-dashed border-[#E5E5EA] dark:border-white/10 flex items-center justify-center gap-4 hover:border-[#005DAB] transition-colors cursor-pointer">
                    <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setReportFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <Download className="w-5 h-5 text-sub" />
                    <span className="text-[10px] font-bold text-sub uppercase tracking-widest">{reportFile ? reportFile.name : 'Choose File'}</span>
                  </div>
                </div>
                <button disabled={submitting} className="w-full py-5 rounded-2xl bg-[#005DAB] text-white font-bold uppercase text-xs tracking-[0.2em] shadow-2xl shadow-[#005DAB]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                  {submitting ? 'Transmitting...' : 'Transmit Work Report'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-[#111827] rounded-[3.5rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl overflow-hidden min-h-[400px]">
        <div className="px-10 py-8 border-b border-[#F2F2F7] dark:border-white/5 flex items-center justify-between bg-[#F9F9FB] dark:bg-[#0B1120]">
          <h3 className="text-xs font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-widest flex items-center ">
            <FileSpreadsheet className="w-4 h-4 mr-3 text-[#005DAB]" /> Chronological Synchronized Logs
          </h3>
          <Filter className="w-4 h-4 text-sub" />
        </div>
        {loading ? (
          <div className="p-20 text-center uppercase tracking-widest text-[10px] font-bold text-sub">Streaming data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F2F2F7] dark:border-white/5">
                  <th className="px-10 py-6 text-[10px] font-bold text-sub uppercase tracking-widest">Segment Mode</th>
                  {isAdmin && <th className="px-6 py-6 text-[10px] font-bold text-sub uppercase tracking-widest">Identity</th>}
                  <th className="px-6 py-6 text-[10px] font-bold text-sub uppercase tracking-widest">Timeline</th>
                  <th className="px-6 py-6 text-[10px] font-bold text-sub uppercase tracking-widest">Duration</th>
                  <th className="px-10 py-6 text-right text-[10px] font-bold text-sub uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F2F7] dark:divide-white/5">
                {(isAdmin ? data : data?.logs)?.map((log) => (
                  <tr key={log._id} className="group hover:bg-[#F9F9FB] dark:hover:bg-[#0B1120] transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-tight text-lead dark:text-[#E5E7EB]">
                        <div className={`w-2 h-2 rounded-full ${log.mode === 'company' ? 'bg-[#005DAB]' : 'bg-[#FFD100]'}`} />
                        {log.mode}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-6">
                        <div className="text-xs font-bold text-lead uppercase tracking-tight">{log.sellerId?.name}</div>
                      </td>
                    )}
                    <td className="px-6 py-6 text-[10px] font-bold text-sub uppercase tracking-widest">
                      {new Date(log.startTime).toLocaleDateString()} â€¢ {new Date(log.startTime).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-6 text-[10px] font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-widest">
                      {log.duration ? formatMinutes(log.duration) : 'Active'}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className={`px-4 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border border-current ${log.status === 'approved' ? 'text-green-500' : 'text-amber-500'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkReports;
