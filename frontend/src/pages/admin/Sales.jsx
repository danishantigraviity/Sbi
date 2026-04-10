import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TrendingUp,
  Search,
  CreditCard,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  XCircle,
  Check,
  ChevronRight,
  Clock,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import ModernDatePicker from "../../components/ModernDatePicker";
import CustomSelect from "../../components/CustomSelect";
import ConfirmModal from "../../components/ConfirmModal";
const AdminSales = () => {
  const [sales, setSales] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingSales: 0,
    totalConversions: 0,
  });
  const [dateFilter, setDateFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  useEffect(() => {
    fetchSales();
    fetchStats();
  }, [dateFilter, agentFilter, statusFilter]);
  useEffect(() => {
    fetchSellers();
  }, []);
  const fetchStats = async () => {
    try {
      const { data } = await axios.get("/api/admin/stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats");
      if (err.response?.status === 429) {
        toast.error(
          "Dashboard stats are temporarily unavailable (Rate limit).",
        );
      }
    }
  };
  const fetchSales = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/sales", {
        params: {
          date: dateFilter || undefined,
          sellerId: agentFilter !== "all" ? agentFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSales(data);
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error(
          "System is busy. Please wait a moment before trying again.",
        );
      } else {
        toast.error(
          "Failed to retrieve sales ledger. Please check your connection.",
        );
      }
    } finally {
      setLoading(false);
    }
  };
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
  const handleUpdateStatus = async (id, status) => {
    setActionLoading(id);
    try {
      await axios.put(
        `/api/admin/sales/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success(
        `Sale ${status === "approved" ? "verified" : "rejected"} successfully`,
      );
      fetchSales();
      fetchStats();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };
  const handleDeleteSale = async (id) => {
    setSaleToDelete(id);
    setShowDeleteConfirm(true);
  };
  const executeDelete = async () => {
    if (!saleToDelete) return;
    try {
      await axios.delete(`/api/admin/sales/${saleToDelete}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Sale record eliminated");
      setShowDeleteConfirm(false);
      setSaleToDelete(null);
      fetchSales();
      fetchStats();
    } catch (err) {
      toast.error("Failed to purge sale record");
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-50 text-green-600 border-green-100";
      case "rejected":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-orange-50 text-orange-600 border-orange-100";
    }
  };
  const getCardIcon = (type) => {
    const t = type.toLowerCase();
    if (t.includes("visa"))
      return <CreditCard className="w-4 h-4 text-blue-600" />;
    if (t.includes("master"))
      return <CreditCard className="w-4 h-4 text-orange-600" />;
    return <CreditCard className="w-4 h-4 text-indigo-600" />;
  };
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {" "}
      {/* Header */}{" "}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {" "}
        <div>
          {" "}
          <h2 className="text-3xl font-bold uppercase tracking-tight ">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Sales</span>{" "}
            <span className="text-[#FFD100]">Verification</span>
          </h2>{" "}
          <p className="text-sub dark:text-[#E5E7EB]/60 font-bold text-xs uppercase tracking-widest mt-1">
            Audit and finalize credit card conversions
          </p>{" "}
        </div>{" "}
        <div className="flex p-1 bg-[#F2F2F7] dark:bg-[#0B1120] rounded-2xl border border-[#E5E5EA] dark:border-white/10 h-fit shadow-sm">
          {" "}
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === s ? "bg-white dark:bg-[#111827] text-[#005DAB] dark:text-[#5AC8FA] shadow-sm" : "text-sub dark:text-[#E5E7EB]/40 hover:text-lead dark:hover:text-[#E5E7EB]"}`}
            >
              {" "}
              {s}{" "}
            </button>
          ))}{" "}
        </div>{" "}
      </div>{" "}
      {/* Stats Row */}{" "}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {" "}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-[#111827] p-8 rounded-[2.5rem] border border-[#E5E5EA] dark:border-white/10 shadow-sm relative overflow-hidden group"
        >
          {" "}
          <div className="absolute top-0 right-0 p-8 text-[#34C759]/5 rotate-12 transform scale-150 transition-transform group-hover:scale-[1.7]">
            {" "}
            <ShieldCheck className="w-32 h-32" />{" "}
          </div>{" "}
          <p className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest mb-1 leading-none">
            Verified Revenue
          </p>{" "}
          <h4 className="text-4xl font-bold text-lead dark:text-[#E5E7EB] tracking-tight ">
            {stats.totalSales}
          </h4>{" "}
          <div className="mt-4 flex items-center text-[10px] font-bold text-[#34C759] uppercase tracking-widest">
            {" "}
            <TrendingUp className="w-3 h-3 mr-1" /> Quality Conversions{" "}
          </div>{" "}
        </motion.div>{" "}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-[#005DAB] p-8 rounded-[2.5rem] text-white shadow-xl shadow-[#005DAB]/20 relative overflow-hidden group"
        >
          {" "}
          <div className="absolute top-0 right-0 p-8 text-white/10 rotate-12 transform scale-150 transition-transform group-hover:scale-[1.7]">
            {" "}
            <Clock className="w-32 h-32" />{" "}
          </div>{" "}
          <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1 leading-none">
            Pending Audit
          </p>{" "}
          <h4 className="text-4xl font-bold text-white tracking-tight ">
            {stats.pendingSales}
          </h4>{" "}
          <div className="mt-4 flex items-center text-[10px] font-bold text-[#FFD100] uppercase tracking-widest">
            {" "}
            <AlertCircle className="w-3 h-3 mr-1" /> Attention Required{" "}
          </div>{" "}
        </motion.div>{" "}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-[#111827] p-8 rounded-[2.5rem] border border-[#E5E5EA] dark:border-white/10 shadow-sm relative overflow-hidden group"
        >
          {" "}
          <div className="absolute top-0 right-0 p-8 text-[#005DAB]/5 rotate-12 transform scale-150 transition-transform group-hover:scale-[1.7]">
            {" "}
            <TrendingUp className="w-32 h-32" />{" "}
          </div>{" "}
          <p className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest mb-1 leading-none">
            Gross Leads
          </p>{" "}
          <h4 className="text-4xl font-bold text-lead dark:text-[#E5E7EB] tracking-tight ">
            {stats.totalConversions}
          </h4>{" "}
          <div className="mt-4 flex items-center text-[10px] font-bold text-[#005DAB] dark:text-[#5AC8FA] uppercase tracking-widest">
            {" "}
            <User className="w-3 h-3 mr-1" /> Conversion Pipeline{" "}
          </div>{" "}
        </motion.div>{" "}
      </div>{" "}
      {/* Filters & Table */}{" "}
      <div className="bg-white dark:bg-[#111827] rounded-[3rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl overflow-hidden">
        {" "}
        <div className="p-10 border-b border-[#E5E5EA] dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-[#F9F9FB]/50 dark:bg-[#0B1120]/50">
          {" "}
          <div className="flex flex-wrap items-center gap-6">
            {" "}
            <div className="w-64">
              {" "}
              <ModernDatePicker
                value={dateFilter}
                onChange={setDateFilter}
                label=""
              />{" "}
            </div>{" "}
            <div className="w-56">
              {" "}
              <CustomSelect
                options={[
                  { label: "All Agents", value: "all" },
                  ...sellers.map((s) => ({ label: s.name, value: s._id })),
                ]}
                value={agentFilter}
                onChange={setAgentFilter}
                placeholder="Filter Agent"
              />{" "}
            </div>{" "}
          </div>{" "}
          <button className="flex items-center px-8 py-4 rounded-2xl bg-text-primary dark:bg-[#005DAB] text-white font-bold uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10">
            {" "}
            <Download className="w-4 h-4 mr-3" /> Export Audit Log{" "}
          </button>{" "}
        </div>{" "}
        <div className="overflow-x-auto px-4 pb-4">
          {" "}
          <table className="w-full">
            {" "}
            <thead>
              {" "}
              <tr className="text-left bg-[#F9F9FB] dark:bg-[#0B1120]">
                {" "}
                <th className="px-8 py-6 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">
                  Agent Detail
                </th>{" "}
                <th className="px-8 py-6 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">
                  Lead / Transaction
                </th>{" "}
                <th className="px-8 py-6 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">
                  Product
                </th>{" "}
                <th className="px-8 py-6 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest text-center">
                  Verification Status
                </th>{" "}
                <th className="px-8 py-6 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">
                  Activity
                </th>{" "}
                <th className="px-8 py-6 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest text-right">
                  Actions
                </th>{" "}
              </tr>{" "}
            </thead>{" "}
            <tbody className="divide-y divide-[#E5E5EA] dark:divide-white/5">
              {" "}
              <AnimatePresence>
                {" "}
                {sales.length > 0 ? (
                  sales.map((sale) => (
                    <motion.tr
                      key={sale._id}
                      layoutId={sale._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-[#F2F2F7]/40 transition-all"
                    >
                      {" "}
                      <td className="px-8 py-6 whitespace-nowrap">
                        {" "}
                        <div className="flex items-center gap-4">
                          {" "}
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#005DAB] to-blue-400 flex items-center justify-center text-white font-bold text-xl uppercase">
                            {" "}
                            {sale.sellerId?.name?.[0]}{" "}
                          </div>{" "}
                          <div>
                            {" "}
                            <p className="text-sm font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight ">
                              {sale.sellerId?.name}
                            </p>{" "}
                            <p className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">
                              {sale.sellerId?.email}
                            </p>{" "}
                          </div>{" "}
                        </div>{" "}
                      </td>{" "}
                      <td className="px-8 py-6 whitespace-nowrap">
                        {" "}
                        <div className="space-y-1">
                          {" "}
                          <p className="text-sm font-bold text-lead dark:text-[#E5E7EB] tracking-tight ">
                            {sale.leadId?.name}
                          </p>{" "}
                          <p className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest flex items-center gap-2">
                            {" "}
                            Ref: {sale._id.slice(-6).toUpperCase()}{" "}
                            <ChevronRight className="w-2 h-2 text-[#005DAB] dark:text-[#5AC8FA]" />{" "}
                            {sale.leadId?.phone}{" "}
                          </p>{" "}
                        </div>{" "}
                      </td>{" "}
                      <td className="px-8 py-6 whitespace-nowrap">
                        {" "}
                        <div className="flex items-center px-4 py-2 bg-[#F2F2F7] dark:bg-[#0B1120] rounded-xl w-fit border border-[#E5E5EA] dark:border-white/5">
                          {" "}
                          {getCardIcon(sale.cardType)}{" "}
                          <span className="ml-3 text-xs font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-widest ">
                            {sale.cardType}
                          </span>{" "}
                        </div>{" "}
                      </td>{" "}
                      <td className="px-8 py-6 whitespace-nowrap">
                        {" "}
                        <div className="flex justify-center">
                          {" "}
                          {sale.status === "pending" ? (
                            <div className="flex items-center gap-2">
                              {" "}
                              <button
                                onClick={() =>
                                  handleUpdateStatus(sale._id, "rejected")
                                }
                                disabled={!!actionLoading}
                                className="p-2.5 rounded-xl bg-red-50 text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white transition-all shadow-sm border border-red-100"
                                title="Reject Conversion"
                              >
                                {" "}
                                <XCircle className="w-4 h-4" />{" "}
                              </button>{" "}
                              <button
                                onClick={() =>
                                  handleUpdateStatus(sale._id, "approved")
                                }
                                disabled={!!actionLoading}
                                className="p-2.5 rounded-xl bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759] hover:text-white transition-all shadow-sm border border-[#34C759]/20"
                                title="Approve Conversion"
                              >
                                {" "}
                                <CheckCircle2 className="w-4 h-4" />{" "}
                              </button>{" "}
                            </div>
                          ) : (
                            <div
                              className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${getStatusColor(sale.status)}`}
                            >
                              {" "}
                              {sale.status === "approved" ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}{" "}
                              {sale.status}{" "}
                            </div>
                          )}{" "}
                        </div>{" "}
                      </td>{" "}
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        {" "}
                        <p className="text-[10px] font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-widest mb-1 ">
                          {" "}
                          {new Date(sale.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                        </p>{" "}
                        <p className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">
                          {" "}
                          {new Date(sale.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                        </p>{" "}
                      </td>{" "}
                      <td className="px-8 py-6 text-right">
                        {" "}
                        <button
                          onClick={() => handleDeleteSale(sale._id)}
                          className="p-2.5 rounded-xl bg-white text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white border border-[#E5E5EA] transition-all shadow-sm active:scale-95"
                          title="Purge Record"
                        >
                          {" "}
                          <Trash2 className="w-4 h-4" />{" "}
                        </button>{" "}
                      </td>{" "}
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {" "}
                    <td colSpan="6" className="px-8 py-32 text-center">
                      {" "}
                      <div className="w-24 h-24 bg-[#F2F2F7] dark:bg-[#0B1120] rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-[#E5E5EA] dark:border-white/10">
                        {" "}
                        <Search className="w-10 h-10 text-sub dark:text-[#E5E7EB]/20 opacity-30" />{" "}
                      </div>{" "}
                      <h3 className="text-2xl font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight ">
                        Zero Conversions
                      </h3>{" "}
                      <p className="text-sub dark:text-[#E5E7EB]/40 font-bold text-[10px] uppercase tracking-widest mt-2">
                        {loading
                          ? "Synthesizing data..."
                          : "No conversion activity found in the current audit window"}
                      </p>{" "}
                    </td>{" "}
                  </motion.tr>
                )}{" "}
              </AnimatePresence>{" "}
            </tbody>{" "}
          </table>{" "}
        </div>{" "}
      </div>{" "}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={executeDelete}
        title="Confirm Purge"
        message="Are you sure you want to permanently strike this sale record from the ledger? This operation is absolute and irrecoverable."
        confirmText="Confirm Purge"
        isDestructive={true}
      />{" "}
    </div>
  );
};
export default AdminSales;
