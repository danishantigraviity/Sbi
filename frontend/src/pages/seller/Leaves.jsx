import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Plus 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../../components/CustomSelect';
import ModernDatePicker from '../../components/ModernDatePicker';

const SellerLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({ 
    type: 'personal', startDate: '', endDate: '', reason: '' 
  });

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const { data } = await axios.get('/api/leaves/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLeaves(data);
    } catch (err) {
      console.error('Fetch leaves error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions

    if (!formData.startDate || !formData.endDate) {
      return toast.error("Check start and end dates");
    }
    setLoading(true);
    try {
      await axios.post("/api/leaves/request", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Leave requested successfully");
      setShowForm(false);
      fetchMyLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return 'bg-[#34C759]/10 text-[#34C759]';
      case 'rejected': return 'bg-red-50 text-red-500';
      default: return 'bg-amber-50 text-amber-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight ">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Leave</span>{" "}
            <span className="text-[#FFD100]">Operations</span>
          </h2>
          <p className="text-sub dark:text-[#E5E7EB]/60 font-medium text-xs uppercase tracking-widest mt-1">
            Request and manage your localized timeframe allocation
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-8 py-4 rounded-2xl bg-[#005DAB] text-white font-bold uppercase text-[10px] tracking-widest shadow-xl">
          {showForm ? 'View History' : 'New Request'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-10 shadow-2xl border border-[#E5E5EA]">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <CustomSelect
                    label="Leave Type"
                    options={[
                      { label: "Personal Leave", value: "personal" },
                      { label: "Sick Leave", value: "sick" },
                      { label: "Emergency Leave", value: "emergency" },
                    ]}
                    value={formData.type}
                    onChange={(v) => setFormData({ ...formData, type: v })}
                    icon={Calendar}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <ModernDatePicker label="Start Date" value={formData.startDate} onChange={(v) => setFormData({...formData, startDate: v})} />
                    <ModernDatePicker label="End Date" value={formData.endDate} onChange={(v) => setFormData({...formData, endDate: v})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-sub">Reason</label>
                  <textarea value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full h-40 p-6 rounded-3xl bg-[#F2F2F7] dark:bg-[#0B1120] border-none font-bold text-xs uppercase" />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 rounded-2xl bg-[#005DAB] text-white font-bold uppercase text-xs tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? "Transmitting..." : "Submit Request"}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-6">
            {leaves.map((leave) => (
              <div key={leave._id} className="bg-white dark:bg-[#111827] p-8 rounded-[2.5rem] border border-[#E5E5EA] shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-lead uppercase tracking-tight">{leave.type} Leave</h4>
                  <p className="text-[10px] font-bold text-sub uppercase tracking-widest mt-1">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${getStatusStyle(leave.status)}`}>
                  {leave.status}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerLeaves;
