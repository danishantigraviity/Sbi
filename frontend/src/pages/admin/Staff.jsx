import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Shield,
  Trash2,
  Edit3,
  Camera,
  XCircle,
  ShieldCheck,
  UserCheck,
  Activity,
  Fingerprint,
  Filter,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect from "../../components/CustomSelect";
import FaceScanner from "../../components/FaceScanner";
const StaffManagement = () => {
  const [sellers, setSellers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newSeller, setNewSeller] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "seller",
    faceSamples: [],
  });
  const [showInternalScanner, setShowInternalScanner] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollingUserId, setEnrollingUserId] = useState(null);
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSellers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, roleFilter]);
  const fetchSellers = async () => {
    try {
      const { data } = await axios.get("/api/admin/sellers", {
        params: { search: searchTerm, role: roleFilter },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSellers(data);
    } catch (err) {
      toast.error("Failed to fetch staff");
    }
  };
  const handleAddSeller = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`/api/admin/seller/${editingId}`, newSeller, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success("Staff profile synchronized successfully");
      } else {
        await axios.post("/api/auth/register", newSeller);
        toast.success("New agent onboarded with biometric identity");
      }
      setShowModal(false);
      fetchSellers();
      setNewSeller({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "seller",
        faceSamples: [],
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      await axios.delete(`/api/admin/seller/${deletingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Agent and all associated data purged");
      fetchSellers();
      setShowDeleteConfirm(false);
      setDeletingId(null);
    } catch (err) {
      toast.error("Data purge failed");
    } finally {
      setLoading(false);
    }
  };
  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };
  const openEditModal = (seller) => {
    setNewSeller({
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      role: seller.role,
      password: "",
      faceSamples: [],
    });
    setEditingId(seller._id);
    setShowModal(true);
  };
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {" "}
      {/* Header Section */}{" "}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {" "}
        <div>
          {" "}
          <h2 className="text-3xl font-bold uppercase tracking-tight ">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Fleet</span>{" "}
            <span className="text-[#FFD100]">Operations</span>
          </h2>{" "}
          <p className="text-sub dark:text-[#E5E7EB]/60 font-medium text-xs uppercase tracking-widest mt-1">
            Onboard personnel and manage localized operational nodes
          </p>{" "}
        </div>{" "}
        <button
          onClick={() => {
            setEditingId(null);
            setNewSeller({
              name: "",
              email: "",
              password: "",
              phone: "",
              role: "seller",
              faceSamples: [],
            });
            setShowInternalScanner(false);
            setShowModal(true);
          }}
          className="px-8 py-4 rounded-2xl bg-[#005DAB] text-white font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-[#005DAB]/20 hover:scale-105 active:scale-95 transition-all flex items-center"
        >
          {" "}
          <UserPlus className="w-4 h-4 mr-3" /> Onboard New Agent{" "}
        </button>{" "}
      </div>{" "}
      {/* Staff Controls & Grid */}{" "}
      <div className="bg-white dark:bg-[#111827] rounded-[3rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl p-2 relative">
        {" "}
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#F9F9FB] dark:bg-[#0B1120] rounded-[2.5rem] border border-[#E5E5EA] dark:border-white/5 m-2 mb-8">
          {" "}
          <div className="relative w-full md:w-96 group">
            {" "}
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-sub dark:text-[#E5E7EB]/40 group-focus-within:text-[#005DAB] dark:group-focus-within:text-[#5AC8FA] transition-colors" />{" "}
            <input
              placeholder="Query by name, email, or Node..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white dark:bg-[#111827] border-2 border-transparent outline-none focus:border-[#005DAB] dark:focus:border-[#5AC8FA] transition-all text-sm font-bold text-lead dark:text-[#E5E7EB] shadow-sm uppercase tracking-tight"
            />{" "}
          </div>{" "}
          <div className="flex items-center gap-4">
            {" "}
            <div className="w-44">
              {" "}
              <CustomSelect
                options={[
                  { label: "All Operations", value: "all" },
                  { label: "Admin Staff", value: "admin" },
                  { label: "Field Agents", value: "seller" },
                ]}
                value={roleFilter}
                onChange={(val) => setRoleFilter(val)}
                placeholder="Filter Role"
                icon={ShieldCheck}
              />{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {" "}
          <AnimatePresence>
            {" "}
            {sellers.map((seller) => (
              <motion.div
                key={seller._id}
                layoutId={seller._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-[#F9F9FB] dark:bg-[#0B1120] p-8 rounded-[2.5rem] border border-[#E5E5EA] dark:border-white/5 relative overflow-hidden hover:shadow-xl hover:shadow-black/20 transition-all"
              >
                {" "}
                {/* Background ID Watermark */}{" "}
                <span className="absolute -top-4 -right-4 text-[6rem] font-bold text-black/5 dark:text-white/5 select-none uppercase tracking-tight">
                  {" "}
                  {seller.role[0]}{" "}
                </span>{" "}
                <div className="relative z-10">
                  {" "}
                  <div className="flex justify-between items-start mb-6">
                    {" "}
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-[#005DAB] to-[#00A3FF] flex items-center justify-center text-white text-2xl font-bold shadow-lg brand-glow">
                      {" "}
                      {seller.name.charAt(0)}{" "}
                    </div>{" "}
                    <div className="flex gap-2">
                      {" "}
                      <button
                        onClick={() => openEditModal(seller)}
                        className="p-3 bg-white dark:bg-[#111827] rounded-xl text-sub dark:text-[#E5E7EB]/40 hover:text-[#005DAB] dark:hover:text-[#5AC8FA] border border-[#E5E5EA] dark:border-white/10 shadow-sm transition-all hover:scale-110"
                      >
                        {" "}
                        <Edit3 className="w-4 h-4" />{" "}
                      </button>{" "}
                      <button
                        onClick={() => confirmDelete(seller._id)}
                        className="p-3 bg-white dark:bg-[#111827] rounded-xl text-[#FF3B30] border border-[#E5E5EA] dark:border-white/10 shadow-sm transition-all hover:scale-110 hover:bg-[#FF3B30] hover:text-white"
                      >
                        {" "}
                        <Trash2 className="w-4 h-4" />{" "}
                      </button>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="space-y-4">
                    {" "}
                    <div>
                      {" "}
                      <h3 className="text-xl font-bold text-lead dark:text-[#E5E7EB] tracking-tight uppercase ">
                        {seller.name}
                      </h3>{" "}
                      <div className="flex items-center mt-1">
                        {" "}
                        <span className="px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest bg-[#005DAB]/10 dark:bg-[#005DAB]/20 text-[#005DAB] dark:text-[#5AC8FA] border border-[#005DAB]/20">
                          {" "}
                          {seller.role}{" "}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="space-y-2 py-4 border-y border-[#E5E5EA] dark:border-white/5">
                      {" "}
                      <div className="flex items-center text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">
                        {" "}
                        <Mail className="w-3.5 h-3.5 mr-3 text-[#005DAB] dark:text-[#5AC8FA]" />{" "}
                        {seller.email}{" "}
                      </div>{" "}
                      <div className="flex items-center text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">
                        {" "}
                        <Phone className="w-3.5 h-3.5 mr-3 text-[#005DAB] dark:text-[#5AC8FA]" />{" "}
                        {seller.phone}{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="flex items-center justify-between pt-2">
                      {" "}
                      <div className="flex items-center gap-2">
                        {" "}
                        <div
                          className={`w-2 h-2 rounded-full ${seller.faceEncodings?.length > 0 ? "bg-[#34C759] animate-pulse shadow-[0_0_8px_rgba(52,199,89,0.5)]" : "bg-text-muted dark:bg-white/20"}`}
                        />{" "}
                        <span className="text-[9px] font-bold text-sub dark:text-[#E5E7EB]/30 uppercase tracking-widest">
                          {" "}
                          {seller.faceEncodings?.length > 0
                            ? "Biometrically Secure"
                            : "Insecure Identity"}{" "}
                        </span>{" "}
                      </div>{" "}
                      <Fingerprint
                        className={`w-5 h-5 ${seller.faceEncodings?.length > 0 ? "text-[#34C759]" : "text-sub/30"}`}
                      />{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </motion.div>
            ))}{" "}
          </AnimatePresence>{" "}
        </div>{" "}
      </div>{" "}
      {/* Modern Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {" "}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />{" "}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-[3rem] shadow-2xl p-10 max-h-[90vh] overflow-y-auto border border-[#E5E5EA] dark:border-white/10"
            >
              {" "}
              <h3 className="text-3xl font-bold mb-8 uppercase tracking-tight border-b border-[#E5E5EA] dark:border-white/10 pb-6">
                {" "}
                {showInternalScanner ? (
                  <>
                    <span className="text-[#005DAB] dark:text-[#5AC8FA]">Biometric</span>{" "}
                    <span className="text-[#FFD100]">Sync</span>
                  </>
                ) : editingId ? (
                  <>
                    <span className="text-[#005DAB] dark:text-[#5AC8FA]">Update</span>{" "}
                    <span className="text-[#FFD100]">Agent</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#005DAB] dark:text-[#5AC8FA]">Agent</span>{" "}
                    <span className="text-[#FFD100]">Onboarding</span>
                  </>
                )}{" "}
              </h3>{" "}
              {showInternalScanner ? (
                <div className="space-y-8">
                  {" "}
                  <FaceScanner
                    mode="enroll"
                    targetSamples={3}
                    onCapture={(samples) => {
                      setNewSeller({ ...newSeller, faceSamples: samples });
                      setShowInternalScanner(false);
                      toast.success("Biometric hash generated");
                    }}
                  />{" "}
                  <button
                    onClick={() => setShowInternalScanner(false)}
                    className="w-full text-xs font-bold uppercase tracking-widest text-sub"
                  >
                    Return to Profile
                  </button>{" "}
                </div>
              ) : (
                <form onSubmit={handleAddSeller} className="space-y-6">
                  {" "}
                  <div className="space-y-1.5">
                    {" "}
                    <label className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest ml-1">
                      Identity Details
                    </label>{" "}
                    <input
                      required
                      placeholder="Agent Full Name"
                      value={newSeller.name}
                      onChange={(e) =>
                        setNewSeller({ ...newSeller, name: e.target.value })
                      }
                      className="w-full px-6 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-none outline-none focus:ring-2 focus:ring-[#005DAB] dark:focus:ring-[#5AC8FA] text-sm font-bold text-lead dark:text-[#E5E7EB] shadow-inner uppercase tracking-widest"
                    />{" "}
                  </div>{" "}
                  <div className="grid grid-cols-2 gap-4">
                    {" "}
                    <div className="space-y-1.5">
                      {" "}
                      <label className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest ml-1">
                        Agent Phone
                      </label>{" "}
                      <input
                        required
                        placeholder="+91..."
                        value={newSeller.phone}
                        onChange={(e) =>
                          setNewSeller({ ...newSeller, phone: e.target.value })
                        }
                        className="w-full px-6 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-none outline-none focus:ring-2 focus:ring-[#005DAB] dark:focus:ring-[#5AC8FA] text-sm font-bold text-lead dark:text-[#E5E7EB] shadow-inner"
                      />{" "}
                    </div>{" "}
                    <div className="space-y-1.5">
                      {" "}
                      <label className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest ml-1">
                        Assigned Role
                      </label>{" "}
                      <CustomSelect
                        options={[
                          { label: "Admin STAFF", value: "admin" },
                          { label: "Field AGENT", value: "seller" },
                        ]}
                        value={newSeller.role}
                        onChange={(val) =>
                          setNewSeller({ ...newSeller, role: val })
                        }
                        icon={Shield}
                      />{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="space-y-1.5">
                    {" "}
                    <label className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest ml-1">
                      Corporate Email
                    </label>{" "}
                    <input
                      required
                      type="email"
                      placeholder="agent@forgeindia.com"
                      value={newSeller.email}
                      onChange={(e) =>
                        setNewSeller({ ...newSeller, email: e.target.value })
                      }
                      className="w-full px-6 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-none outline-none focus:ring-2 focus:ring-[#005DAB] dark:focus:ring-[#5AC8FA] text-sm font-bold text-lead dark:text-[#E5E7EB] shadow-inner"
                    />{" "}
                  </div>{" "}
                  {!editingId && (
                    <div className="space-y-1.5">
                      {" "}
                      <label className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest ml-1">
                        Security Key
                      </label>{" "}
                      <input
                        required
                        type="password"
                        placeholder="Passphrase"
                        value={newSeller.password}
                        onChange={(e) =>
                          setNewSeller({
                            ...newSeller,
                            password: e.target.value,
                          })
                        }
                        className="w-full px-6 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-none outline-none focus:ring-2 focus:ring-[#005DAB] dark:focus:ring-[#5AC8FA] text-sm font-bold text-lead dark:text-[#E5E7EB] shadow-inner"
                      />{" "}
                    </div>
                  )}{" "}
                  <motion.div
                    layout
                    className="p-8 bg-white dark:bg-[#0B1120] rounded-[2rem] border border-[#005DAB]/20 shadow-2xl relative overflow-hidden group mt-6"
                  >
                    {" "}
                    <Fingerprint className="absolute -bottom-4 -left-4 w-24 h-24 text-[#005DAB]/10" />{" "}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      {" "}
                      <div
                        className={`p-4 rounded-2xl mb-4 ${newSeller.faceSamples.length > 0 ? "bg-[#34C759] shadow-[0_0_20px_rgba(52,199,89,0.3)]" : "bg-[#005DAB]"}`}
                      >
                        {" "}
                        <Camera className="w-6 h-6 text-white" />{" "}
                      </div>{" "}
                      <h4 className="text-lead dark:text-[#E5E7EB] font-bold text-sm uppercase tracking-widest mb-1">
                        Face Recognition
                      </h4>{" "}
                      <p className="text-sub dark:text-[#E5E7EB]/40 text-[10px] font-bold uppercase tracking-widest mb-6">
                        {" "}
                        {newSeller.faceSamples.length > 0
                          ? "Biometric Identity Locked"
                          : "Secure Biometric Scan Required"}{" "}
                      </p>{" "}
                      <button
                        type="button"
                        onClick={() => setShowInternalScanner(true)}
                        className="w-full py-4 rounded-xl bg-[#F2F2F7] dark:bg-[#111827] text-lead dark:text-[#E5E7EB] font-bold uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all border border-[#E5E5EA] dark:border-white/10"
                      >
                        {" "}
                        {newSeller.faceSamples.length > 0
                          ? "Ready - Retake"
                          : "Update Biometrics"}{" "}
                      </button>{" "}
                    </div>{" "}
                  </motion.div>{" "}
                  <div className="flex gap-4 pt-4">
                    {" "}
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-5 rounded-[1.5rem] bg-[#F2F2F7] dark:bg-[#0B1120] text-lead dark:text-[#E5E7EB] font-bold uppercase text-[10px] tracking-widest"
                    >
                      Cancel
                    </button>{" "}
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-5 rounded-[1.5rem] bg-[#005DAB] text-white font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-[#005DAB]/20"
                    >
                      {" "}
                      {loading ? "..." : editingId ? "Update" : "Confirm"}{" "}
                    </button>{" "}
                  </div>{" "}
                </form>
              )}{" "}
            </motion.div>{" "}
          </div>
        )}{" "}
        {/* Delete Confirmation */}{" "}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-xl">
            {" "}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white border border-[#E5E5EA] rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl"
            >
              {" "}
              <div className="w-20 h-20 bg-red-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                {" "}
                <Trash2 className="w-10 h-10 text-red-500" />{" "}
              </div>{" "}
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">
                <span className="text-[#005DAB]">Purge</span>{" "}
                <span className="text-red-500">Agent?</span>
              </h3>{" "}
              <p className="text-sub text-sm font-bold uppercase tracking-widest leading-relaxed mb-10">
                {" "}
                Executing this action will permanently clear the agent and all
                associated shift history and sales records.{" "}
              </p>{" "}
              <div className="flex gap-4">
                {" "}
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-4 bg-[#F2F2F7] text-sub rounded-2xl font-bold uppercase text-[10px] tracking-widest"
                >
                  Abort
                </button>{" "}
                <button
                  onClick={handleDelete}
                  className="flex-1 py-4 bg-[#FF3B30] text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-[#FF3B30]/30"
                >
                  Execute
                </button>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default StaffManagement;
