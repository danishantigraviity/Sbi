import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UserPlus,
  Search,
  Filter,
  User,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Target,
  Users,
  Trash2,
  Edit2,
  Plus,
  X,
  MapPin,
  ShieldCheck,
  PlusCircle,
  Hash,
  PhoneOutgoing,
  Download,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect from "../../components/CustomSelect";
import ConfirmModal from "../../components/ConfirmModal";
const AdminLeads = () => {
  const [leads, setLeads] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeller, setFilterSeller] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    sellerId: "",
    status: "new",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  useEffect(() => {
    fetchSellers();
    fetchLeads();
  }, [filterStatus, filterSeller]);
  const fetchSellers = async () => {
    try {
      const { data } = await axios.get("/api/admin/sellers", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSellers(data);
    } catch (err) {
      console.error("Failed to fetch sellers");
    }
  };
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/leads", {
        params: {
          status: filterStatus,
          sellerId: filterSeller,
          search: searchQuery,
        },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLeads(data);
    } catch (err) {
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };
  const handleCreateOrUpdateLead = async (e) => {
    e.preventDefault();
    if (!newLead.name || !newLead.phone || !newLead.sellerId) {
      toast.error("Name, Phone, and Agent are required");
      return;
    }
    try {
      if (editingId) {
        await axios.put(`/api/admin/lead/${editingId}`, newLead, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success("Lead updated successfully");
      } else {
        await axios.post("/api/admin/leads", newLead, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success("New lead created successfully");
      }
      setShowModal(false);
      setEditingId(null);
      setNewLead({
        name: "",
        email: "",
        phone: "",
        address: "",
        sellerId: "",
        status: "new",
      });
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };
  const handleDeleteLead = async (id) => {
    setLeadToDelete(id);
    setShowDeleteConfirm(true);
  };
  const executeDelete = async () => {
    if (!leadToDelete) return;
    try {
      await axios.delete(`/api/admin/lead/${leadToDelete}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Lead deleted successfully");
      setShowDeleteConfirm(false);
      setLeadToDelete(null);
      fetchLeads();
    } catch (err) {
      toast.error("Failed to eliminate lead");
    }
  };
  const openEditModal = (lead) => {
    setNewLead({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      address: lead.address,
      sellerId: lead.sellerId?._id || "",
      status: lead.status,
    });
    setEditingId(lead._id);
    setShowModal(true);
  };
  const getStatusStyle = (status) => {
    switch (status) {
      case "converted":
        return "bg-[#34C759]/10 text-[#34C759]";
      case "called":
        return "bg-[#007AFF]/10 text-[#007AFF]";
      default:
        return "bg-[#FF9500]/10 text-[#FF9500]";
    }
  };
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {" "}
      {/* Header & Stats */}{" "}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {" "}
        <div>
          {" "}
          <h2 className="text-4xl font-bold uppercase tracking-tight ">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Lead</span>{" "}
            <span className="text-[#FFD100]">Intelligence</span>
          </h2>{" "}
          <p className="text-sub dark:text-[#E5E7EB]/60 font-medium text-xs uppercase tracking-[0.2em] mt-2 flex items-center">
            {" "}
            <ShieldCheck className="w-4 h-4 mr-2 text-[#005DAB] dark:text-[#5AC8FA]" />{" "}
            Encrypted Central Lead Repository{" "}
          </p>{" "}
        </div>{" "}
        <div className="flex items-center gap-4">
          {" "}
          <button
            onClick={() => {
              setNewLead({
                name: "",
                email: "",
                phone: "",
                address: "",
                sellerId: "",
                status: "new",
              });
              setEditingId(null);
              setShowModal(true);
            }}
            className="px-8 py-4 rounded-[1.5rem] bg-[#005DAB] text-white font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-[#005DAB]/20 flex items-center hover:scale-105 active:scale-95 transition-all"
          >
            {" "}
            <PlusCircle className="w-4 h-4 mr-3 text-[#FFD100]" /> Initialize
            Lead{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {/* Filters Area */}{" "}
      <div className="bg-white dark:bg-[#111827] p-8 rounded-[3rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl">
        {" "}
        <div className="flex flex-wrap items-center gap-6">
          {" "}
          <div className="relative flex-1 min-w-[300px]">
            {" "}
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-sub dark:text-[#E5E7EB]/40" />{" "}
            <input
              placeholder="Query by name, contact, or unique ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchLeads()}
              className="w-full pl-16 pr-6 py-5 rounded-[1.8rem] bg-[#F2F2F7] dark:bg-[#0B1120] border-2 border-transparent focus:border-[#005DAB] dark:focus:border-[#5AC8FA] outline-none text-sm font-bold text-lead dark:text-[#E5E7EB] transition-all uppercase tracking-tight placeholder:text-sub/50"
            />{" "}
          </div>{" "}
          <div className="flex items-center gap-4">
            {" "}
            <div className="w-48">
              {" "}
              <CustomSelect
                options={[
                  { label: "All Agents", value: "all" },
                  ...sellers.map((s) => ({ label: s.name, value: s._id })),
                ]}
                value={filterSeller}
                onChange={setFilterSeller}
                placeholder="Filter Agent"
                icon={Users}
              />{" "}
            </div>{" "}
            <div className="w-48">
              {" "}
              <CustomSelect
                options={[
                  { label: "All Status", value: "all" },
                  { label: "New Lead", value: "new" },
                  { label: "Called", value: "called" },
                  { label: "Converted", value: "converted" },
                ]}
                value={filterStatus}
                onChange={setFilterStatus}
                icon={Target}
              />{" "}
            </div>{" "}
            <button
              onClick={fetchLeads}
              className="p-5 rounded-[1.5rem] bg-[#005DAB] text-white hover:bg-[#004A8A] transition-all shadow-lg shadow-[#005DAB]/20"
            >
              {" "}
              <Filter className="w-5 h-5" />{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Leads Table */}{" "}
      <div className="bg-white dark:bg-[#111827] rounded-[3.5rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl relative">
        {" "}
        <div className="overflow-x-auto">
          {" "}
          <table className="w-full">
            {" "}
            <thead>
              {" "}
              <tr className="bg-[#F9F9FB] dark:bg-[#0B1120] border-b border-[#E5E5EA] dark:border-white/5">
                {" "}
                <th className="px-10 py-8 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-[0.2em] flex items-center">
                  {" "}
                  <Hash className="w-4 h-4 mr-2" /> Identity{" "}
                </th>{" "}
                <th className="px-10 py-8 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-[0.2em]">
                  Contact Node
                </th>{" "}
                <th className="px-10 py-8 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-[0.2em]">
                  Current Pulse
                </th>{" "}
                <th className="px-10 py-8 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-[0.2em]">
                  Assigned Agent
                </th>{" "}
                <th className="px-10 py-8 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-[0.2em] text-right">
                  Actions
                </th>{" "}
              </tr>{" "}
            </thead>{" "}
            <tbody className="divide-y divide-[#E5E5EA] dark:divide-white/5">
              {" "}
              <AnimatePresence>
                {" "}
                {leads.length > 0 ? (
                  leads.map((lead) => (
                    <motion.tr
                      key={lead._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[#F2F2F7]/50 dark:hover:bg-white/5 transition-all group"
                    >
                      {" "}
                      <td className="px-10 py-6 whitespace-nowrap">
                        {" "}
                        <div className="text-sm font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight ">
                          {lead.name}
                        </div>{" "}
                        <div className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest mt-0.5">
                          {lead._id.slice(-8)}
                        </div>{" "}
                      </td>{" "}
                      <td className="px-10 py-6 whitespace-nowrap">
                        {" "}
                        <div className="flex flex-col">
                          {" "}
                          <span className="text-sm font-bold text-lead dark:text-[#E5E7EB] tracking-tight ">
                            {lead.phone}
                          </span>{" "}
                          <span className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/60 uppercase tracking-widest leading-none mt-1">
                            {lead.email}
                          </span>{" "}
                        </div>{" "}
                      </td>{" "}
                      <td className="px-10 py-6">
                        {" "}
                        <div
                          className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block ${getStatusStyle(lead.status)}`}
                        >
                          {" "}
                          {lead.status}{" "}
                        </div>{" "}
                      </td>{" "}
                      <td className="px-10 py-6">
                        {" "}
                        <div className="flex items-center gap-3">
                          {" "}
                          <div className="w-8 h-8 rounded-xl bg-[#005DAB]/10 flex items-center justify-center text-[#005DAB]">
                            {" "}
                            <Users className="w-4 h-4" />{" "}
                          </div>{" "}
                          <div>
                            {" "}
                            <p className="text-xs font-bold text-lead dark:text-[#E5E7EB]">
                              {lead.sellerId?.name || "Unassigned"}
                            </p>{" "}
                          </div>{" "}
                        </div>{" "}
                      </td>{" "}
                      <td className="px-10 py-6 text-right">
                        {" "}
                        <div className="flex justify-end gap-2">
                          {" "}
                          <button
                            onClick={() => openEditModal(lead)}
                            className="p-2 bg-white dark:bg-[#111827] rounded-xl text-[#005DAB] hover:bg-[#005DAB] hover:text-white border border-[#E5E5EA] dark:border-white/10 transition-all shadow-sm active:scale-95"
                          >
                            {" "}
                            <Edit2 className="w-4 h-4" />{" "}
                          </button>{" "}
                          <button
                            onClick={() => handleDeleteLead(lead._id)}
                            className="p-2 bg-white dark:bg-[#111827] rounded-xl text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white border border-[#E5E5EA] dark:border-white/10 transition-all shadow-sm active:scale-95"
                          >
                            {" "}
                            <Trash2 className="w-4 h-4" />{" "}
                          </button>{" "}
                        </div>{" "}
                      </td>{" "}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    {" "}
                    <td colSpan="5" className="px-10 py-32 text-center">
                      {" "}
                      <div className="w-24 h-24 bg-[#F2F2F7] dark:bg-[#0B1120] rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-[#E5E5EA] dark:border-white/10">
                        {" "}
                        <PhoneOutgoing className="w-10 h-10 text-sub dark:text-[#E5E7EB]/20 opacity-30" />{" "}
                      </div>{" "}
                      <h3 className="text-2xl font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight ">
                        Zero Metrics Found
                      </h3>{" "}
                      <p className="text-sub dark:text-[#E5E7EB]/40 text-[10px] font-bold uppercase tracking-widest mt-2">
                        Filter state yielded no matching lead records in the
                        system
                      </p>{" "}
                    </td>{" "}
                  </tr>
                )}{" "}
              </AnimatePresence>{" "}
            </tbody>{" "}
          </table>{" "}
        </div>{" "}
      </div>{" "}
      {/* Lead Management Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] flex items-center justify-center p-6">
            {" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-[#111827] w-full max-w-md rounded-[2rem] border-4 border-white dark:border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {" "}
              <div className="p-5 bg-[#005DAB] text-white">
                {" "}
                <div className="flex items-center justify-between mb-1">
                  {" "}
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    {" "}
                    <PlusCircle className="w-4 h-4 text-[#FFD100]" />{" "}
                  </div>{" "}
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1 hover:bg-white/10 rounded-full transition-all"
                  >
                    {" "}
                    <X className="w-4 h-4" />{" "}
                  </button>{" "}
                </div>{" "}
                <h3 className="text-lg font-bold uppercase tracking-tight ">
                  {" "}
                  {editingId ? "Update Profile" : "Lead Initialization"}{" "}
                </h3>{" "}
              </div>{" "}
              <form
                onSubmit={handleCreateOrUpdateLead}
                className="p-5 space-y-3"
              >
                {" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {" "}
                  <div className="space-y-2">
                    {" "}
                    <label className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/60 uppercase tracking-widest ml-4">
                      Full Name
                    </label>{" "}
                    <div className="relative">
                      {" "}
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#005DAB]" />{" "}
                      <input
                        required
                        value={newLead.name}
                        onChange={(e) =>
                          setNewLead({ ...newLead, name: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-2 border-transparent focus:border-[#005DAB] outline-none font-bold text-sm dark:text-white"
                        placeholder="Customer identity"
                      />{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="space-y-2">
                    {" "}
                    <label className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/60 uppercase tracking-widest ml-4">
                      Phone Number
                    </label>{" "}
                    <div className="relative">
                      {" "}
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#005DAB]" />{" "}
                      <input
                        required
                        value={newLead.phone}
                        onChange={(e) =>
                          setNewLead({ ...newLead, phone: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-2 border-transparent focus:border-[#005DAB] outline-none font-bold text-sm dark:text-white"
                        placeholder="Direct contact"
                      />{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="space-y-2">
                    {" "}
                    <label className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/60 uppercase tracking-widest ml-4">
                      Email Address
                    </label>{" "}
                    <div className="relative">
                      {" "}
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#005DAB]" />{" "}
                      <input
                        value={newLead.email}
                        onChange={(e) =>
                          setNewLead({ ...newLead, email: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-2 border-transparent focus:border-[#005DAB] outline-none font-bold text-sm dark:text-white"
                        placeholder="Electronic mail (Optional)"
                      />{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="space-y-2">
                    {" "}
                    <label className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/60 uppercase tracking-widest ml-4">
                      Assign Agent
                    </label>{" "}
                    <CustomSelect
                      options={sellers.map((s) => ({
                        label: s.name,
                        value: s._id,
                      }))}
                      value={newLead.sellerId}
                      onChange={(val) =>
                        setNewLead({ ...newLead, sellerId: val })
                      }
                      placeholder="Select Fleet Member"
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <label className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/60 uppercase tracking-widest ml-4">
                    Current Status
                  </label>{" "}
                  <div className="flex flex-wrap gap-4">
                    {" "}
                    {["new", "called", "converted"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewLead({ ...newLead, status: s })}
                        className={`px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${newLead.status === s ? "bg-[#005DAB] text-white shadow-lg" : "bg-[#F2F2F7] dark:bg-[#0B1120] text-sub hover:bg-[#E5E5EA] dark:text-[#E5E7EB]"}`}
                      >
                        {" "}
                        {s}{" "}
                      </button>
                    ))}{" "}
                  </div>{" "}
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <label className="text-[10px] font-bold text-sub uppercase tracking-widest ml-4">
                    Primary Address
                  </label>{" "}
                  <div className="relative">
                    {" "}
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-[#005DAB]" />{" "}
                    <textarea
                      required
                      value={newLead.address}
                      onChange={(e) =>
                        setNewLead({ ...newLead, address: e.target.value })
                      }
                      rows="2"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-2 border-transparent focus:border-[#005DAB] outline-none font-bold text-sm dark:text-white resize-none"
                      placeholder="Shipping or residential coordinates"
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex gap-3 pt-4">
                  {" "}
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 rounded-[1.2rem] bg-[#F2F2F7] dark:bg-white/5 text-lead dark:text-[#E5E7EB] font-bold uppercase text-[9px] tracking-widest hover:bg-[#E5E5EA] dark:hover:bg-white/10 transition-all"
                  >
                    {" "}
                    Cancel{" "}
                  </button>{" "}
                  <button
                    type="submit"
                    className="flex-1 py-4 rounded-[1.2rem] bg-[#005DAB] text-white font-bold uppercase text-[9px] tracking-widest shadow-xl shadow-[#005DAB]/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {" "}
                    {editingId
                      ? "Purge & Update"
                      : "Initialize Fleet Lead"}{" "}
                  </button>{" "}
                </div>{" "}
              </form>{" "}
            </motion.div>{" "}
          </div>
        )}{" "}
      </AnimatePresence>{" "}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={executeDelete}
        title="Confirm Deletion"
        message="Are you sure you want to permanently eliminate this lead from the intelligence matrix? This action cannot be reversed."
        confirmText="Execute Deletion"
        isDestructive={true}
      />{" "}
    </div>
  );
};
export default AdminLeads;
