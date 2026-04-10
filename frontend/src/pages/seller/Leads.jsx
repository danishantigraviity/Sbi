import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserPlus, 
  Search, 
  PhoneOutgoing, 
  Mail, 
  MapPin, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  Filter,
  Target,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../../components/CustomSelect';

const LeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [callData, setCallData] = useState({ callStatus: 'interested', notes: '' });
  const [saleData, setSaleData] = useState({ cardType: 'platinum' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data } = await axios.get('/api/seller/leads', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLeads(data || []);
    } catch (err) {
      console.error('Fetch leads error');
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/seller/leads', newLead, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Lead added successfully');
      setShowModal(false);
      fetchLeads();
      setNewLead({ name: '', email: '', phone: '', address: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogCall = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/seller/calls', { leadId: selectedLead._id, ...callData }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Call logged successfully');
      setShowCallModal(false);
      fetchLeads();
      setCallData({ callStatus: 'interested', notes: '' });
    } catch (err) {
      toast.error('Failed to log call');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/seller/sales', { leadId: selectedLead._id, ...saleData }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Conversion submitted for verification! 🎉');
      setShowConvertModal(false);
      fetchLeads();
    } catch (err) {
      toast.error('Failed to record conversion');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lead.phone.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'converted': return 'bg-[#34C759]/10 text-[#34C759]';
      case 'called': return 'bg-[#005DAB]/10 text-[#005DAB]';
      default: return 'bg-[#FFD100]/10 text-lead';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight ">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Leads</span>{" "}
            <span className="text-[#FFD100]">Registry</span>
          </h2>
          <p className="text-sub dark:text-[#E5E7EB]/60 font-medium text-xs uppercase tracking-widest mt-1">
            Track and manage your localized commercial pipeline
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowModal(true)} className="px-6 py-3 rounded-2xl bg-[#005DAB] text-white font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-[#005DAB]/20 flex items-center hover:scale-105 active:scale-95 transition-all">
            <UserPlus className="w-4 h-4 mr-3" /> Add New Lead
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-[#E5E5EA] dark:border-white/10 shadow-2xl relative">
        <div className="p-6 border-b border-[#E5E5EA] dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F9F9FB] dark:bg-[#0B1120]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sub dark:text-[#E5E7EB]/40" />
            <input 
              placeholder="Query by name or phone..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-[#111827] border-2 border-transparent outline-none focus:border-[#005DAB] dark:focus:border-[#5AC8FA] transition-all text-lead dark:text-[#E5E7EB] shadow-sm font-bold uppercase tracking-widest text-xs "
            />
          </div>
          <div className="w-44">
            <CustomSelect
              options={[
                { label: "All Status", value: "all" },
                { label: "New", value: "new" },
                { label: "Called", value: "called" },
                { label: "Converted", value: "converted" },
              ]}
              value={filterStatus}
              onChange={(val) => setFilterStatus(val)}
              placeholder="Filter Status"
              icon={Target}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
          {filteredLeads.length > 0 ? filteredLeads.map((lead) => (
            <motion.div key={lead._id} whileHover={{ y: -5 }} className="bg-[#F9F9FB] dark:bg-[#0B1120] p-6 rounded-[2.5rem] border border-[#E5E5EA] dark:border-white/5 shadow-sm group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${getStatusStyle(lead.status)}`}>
                  {lead.status}
                </div>
                <MoreVertical className="w-4 h-4 text-sub" />
              </div>
              <h3 className="text-xl font-bold text-lead dark:text-[#E5E7EB] mb-4 uppercase tracking-tight ">{lead.name}</h3>
              <div className="space-y-3 mb-8 py-4 border-y border-[#E5E5EA] dark:border-white/5">
                <div className="flex items-center text-[10px] font-bold text-sub uppercase tracking-widest">
                  <PhoneOutgoing className="w-3.5 h-3.5 mr-3 text-[#005DAB]" /> {lead.phone}
                </div>
                <div className="flex items-center text-[10px] font-bold text-sub uppercase tracking-widest">
                  <Mail className="w-3.5 h-3.5 mr-3 text-[#005DAB]" /> {lead.email}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedLead(lead); setShowCallModal(true); }} className="flex-1 py-3 rounded-2xl bg-white dark:bg-[#111827] text-[10px] font-bold uppercase tracking-widest text-lead border border-[#E5E5EA] hover:bg-[#F2F2F7] transition-all">Update</button>
                <button onClick={() => { setSelectedLead(lead); setShowConvertModal(true); }} className="flex-1 py-3 rounded-2xl bg-[#FFD100] text-lead text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#FFD100]/20 hover:scale-105 transition-all">Mark Converted</button>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-24 text-center">
              <h3 className="text-xl font-bold text-lead uppercase tracking-tight">No Leads Found</h3>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white dark:bg-[#111827] rounded-[2rem] shadow-2xl p-8 border border-[#E5E5EA]">
              <h3 className="text-xl font-bold mb-6 uppercase tracking-tight">
                <span className="text-[#005DAB] dark:text-[#5AC8FA]">Add</span>{" "}
                <span className="text-[#FFD100]">New Lead</span>
              </h3>
              <form onSubmit={handleAddLead} className="space-y-4">
                <input required placeholder="Name" value={newLead.name} onChange={(e) => setNewLead({...newLead, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-none font-bold text-sm" />
                <input required placeholder="Phone" value={newLead.phone} onChange={(e) => setNewLead({...newLead, phone: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-none font-bold text-sm" />
                <input type="email" placeholder="Email" value={newLead.email} onChange={(e) => setNewLead({...newLead, email: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-none font-bold text-sm" />
                <textarea placeholder="Address" value={newLead.address} onChange={(e) => setNewLead({...newLead, address: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-none font-bold text-sm resize-none" />
                <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-[#005DAB] text-white font-bold uppercase text-[10px] tracking-widest shadow-xl">Add Lead</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCallModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white dark:bg-[#111827] rounded-[2rem] shadow-2xl p-8 border border-[#E5E5EA]">
              <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">
                <span className="text-[#005DAB] dark:text-[#5AC8FA]">Log</span>{" "}
                <span className="text-[#FFD100]">Interaction</span>
              </h3>
              <p className="text-[10px] font-bold text-sub uppercase tracking-widest mb-6">Agent Detail: {selectedLead?.name}</p>
              <form onSubmit={handleLogCall} className="space-y-4">
                <CustomSelect
                  label="Interaction Outcome"
                  options={[
                    { label: "Interested / Lead Positive", value: "interested" },
                    { label: "Busy / Callback Requested", value: "busy" },
                    {
                      label: "Not Interested / Lead Dead",
                      value: "not_interested",
                    },
                  ]}
                  value={callData.callStatus}
                  onChange={(val) =>
                    setCallData({ ...callData, callStatus: val })
                  }
                  icon={PhoneOutgoing}
                />
                <textarea 
                  placeholder="Summary of operational dialogue..." 
                  value={callData.notes} 
                  onChange={(e) => setCallData({...callData, notes: e.target.value})} 
                  className="w-full px-6 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-none font-bold text-sm h-32 resize-none" 
                />
                <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-[#005DAB] text-white font-bold uppercase text-[10px] tracking-widest shadow-xl">{loading ? 'Logging...' : 'Finalize Interaction'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConvertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConvertModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white dark:bg-[#111827] rounded-[2rem] shadow-2xl p-8 border border-[#E5E5EA]">
              <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">
                <span className="text-[#005DAB] dark:text-[#5AC8FA]">Convert</span>{" "}
                <span className="text-[#FFD100]">Status</span>
              </h3>
              <p className="text-[10px] font-bold text-sub uppercase tracking-widest mb-6">Subject: {selectedLead?.name}</p>
              <form onSubmit={handleCreateSale} className="space-y-6">
                <CustomSelect
                  label="Product Tier Selection"
                  options={[
                    { label: "Visa Platinum - Standard", value: "platinum" },
                    { label: "Visa Signature - Premium", value: "signature" },
                    { label: "Visa Infinite - Ultimate", value: "infinite" },
                    { label: "Mastercard Gold", value: "gold" },
                    { label: "Mastercard World", value: "world" },
                  ]}
                  value={saleData.cardType}
                  onChange={(val) =>
                    setSaleData({ ...saleData, cardType: val })
                  }
                  icon={CreditCard}
                />
                <p className="text-[10px] font-bold text-sub/60 uppercase tracking-widest italic leading-relaxed">Note: Conversion data will be submitted to administrative nodes for final audit and credit assignment.</p>
                <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-[#FFD100] text-lead font-bold uppercase text-[10px] tracking-widest shadow-xl">Confirm Conversion</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadsManagement;
