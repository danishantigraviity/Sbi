import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ShieldCheck,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  UserPlus,
  X,
  RefreshCw,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setWorkMode } from "../../slices/authSlice";
const DutyPermissions = () => {
  const dispatch = useDispatch();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestReason, setRequestReason] = useState("");
  const [requestDuration, setRequestDuration] = useState("2");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMode, setRequestMode] = useState("personal");
  const [workStatus, setWorkStatus] = useState({
    workMode: "idle",
    pendingRequest: null,
  });
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/work/my-requests", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRequests(data);
    } catch (err) {
      toast.error("Failed to fetch request history");
    } finally {
      setLoading(false);
    }
  };
  const fetchWorkStatus = async () => {
    try {
      const { data } = await axios.get("/api/work/status", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setWorkStatus(data);
    } catch (err) {
      console.error("Failed to fetch work status");
    }
  };
  useEffect(() => {
    fetchRequests();
    fetchWorkStatus();
  }, []);
  const handleSubmitRequest = async () => {
    if (!requestReason) return toast.error("Reason is required");
    setRequestLoading(true);
    try {
      const { data } = await axios.post(
        "/api/work/start",
        {
          mode: requestMode,
          reason: requestReason,
          duration: parseInt(requestDuration),
          lat: 12.8707332,
          lng: 78.1082435,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setShowRequestModal(false);
      setRequestReason("");
      toast.success("Request sent to admin");
      fetchRequests();
      fetchWorkStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    } finally {
      setRequestLoading(false);
    }
  };
  const statusIcons = {
    pending: <Clock className="w-5 h-5 text-[#FFD100]" />,
    approved: <CheckCircle2 className="w-5 h-5 text-[#34C759]" />,
    rejected: <XCircle className="w-5 h-5 text-[#FF3B30]" />,
  };
  const statusStyles = {
    pending: "bg-[#FFD100]/10 text-[#FFD100] border-[#FFD100]/20",
    approved: "bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20",
    rejected: "bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20",
  };
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {" "}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {" "}
        <div>
          {" "}
          <h2 className="text-3xl font-bold uppercase tracking-tight ">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Duty</span>{" "}
            <span className="text-[#FFD100]">Permissions</span>
          </h2>{" "}
          <p className="text-sub dark:text-[#E5E7EB]/60 font-bold text-xs uppercase tracking-widest mt-1">
            Request authorization for personal or office work segments
          </p>{" "}
        </div>{" "}
        <div className="flex items-center gap-4">
          {" "}
          <button
            onClick={fetchRequests}
            className="p-3 rounded-2xl bg-white dark:bg-[#111827] text-sub border border-[#E5E5EA] dark:border-white/10 shadow-sm hover:text-[#005DAB] transition-colors"
          >
            {" "}
            <RefreshCw
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            />{" "}
          </button>{" "}
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center px-8 py-3.5 rounded-2xl bg-[#FFD100] text-[#005DAB] font-bold uppercase text-xs tracking-widest shadow-xl shadow-[#FFD100]/20 hover:scale-105 active:scale-95 transition-all"
          >
            {" "}
            <Plus className="w-4 h-4 mr-2" /> New Permission{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {workStatus.pendingRequest && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFD100]/10 border border-[#FFD100]/20 p-6 rounded-[2rem] flex items-center justify-between"
        >
          {" "}
          <div className="flex items-center gap-4">
            {" "}
            <div className="w-12 h-12 bg-[#FFD100] rounded-2xl flex items-center justify-center">
              {" "}
              <Clock className="w-6 h-6 text-[#005DAB]" />{" "}
            </div>{" "}
            <div>
              {" "}
              <h4 className="text-sm font-bold text-[#005DAB] uppercase tracking-widest">
                Active Request Pending
              </h4>{" "}
              <p className="text-[10px] font-bold text-sub uppercase tracking-widest mt-1">
                Waiting for Admin to authorize your{" "}
                {workStatus.pendingRequest.mode === "office"
                  ? "Office Work"
                  : "Personal"}{" "}
                {workStatus.pendingRequest.requestedDuration}H segment
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className="px-4 py-2 bg-[#FFD100] text-[#005DAB] text-[10px] font-bold uppercase tracking-widest rounded-xl animate-pulse">
            {" "}
            In Review{" "}
          </div>{" "}
        </motion.div>
      )}{" "}
      <div className="bg-white dark:bg-[#111827] rounded-[3rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl overflow-hidden min-h-[400px]">
        {" "}
        {loading && requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            {" "}
            <div className="w-12 h-12 border-4 border-[#005DAB]/10 border-t-[#005DAB] rounded-full animate-spin" />{" "}
            <p className="text-[10px] font-bold text-sub uppercase tracking-widest">
              Loading permissions history...
            </p>{" "}
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            {" "}
            <div className="w-24 h-24 bg-[#F2F2F7] dark:bg-[#0B1120] rounded-[2.5rem] flex items-center justify-center mb-6 border border-[#E5E5EA] dark:border-white/10 shadow-inner">
              {" "}
              <ShieldCheck className="w-10 h-10 text-sub opacity-20" />{" "}
            </div>{" "}
            <h3 className="text-2xl font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight mb-2">
              No Requests
            </h3>{" "}
            <p className="text-sub text-[10px] font-bold uppercase tracking-widest">
              You haven't requested any duty permissions yet
            </p>{" "}
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {" "}
            <AnimatePresence>
              {" "}
              {requests.map((req) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#F9F9FB] dark:bg-[#0B1120] p-6 rounded-[2.5rem] border border-[#E5E5EA] dark:border-white/5 relative group hover:border-[#005DAB]/30 transition-all"
                >
                  {" "}
                  <div className="flex justify-between items-start mb-6">
                    {" "}
                    <div
                      className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border flex items-center gap-2 ${statusStyles[req.status]}`}
                    >
                      {" "}
                      {statusIcons[req.status]} {req.status}{" "}
                    </div>{" "}
                    <span
                      className={`text-[8px] font-bold uppercase ${req.mode === "office" ? "text-indigo-500" : "text-orange-500"} tracking-widest`}
                    >
                      {" "}
                      {req.mode === "office" ? "Office Work" : "Personal"}{" "}
                    </span>{" "}
                  </div>{" "}
                  <div className="space-y-4">
                    {" "}
                    <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-[#E5E5EA] dark:border-white/10">
                      {" "}
                      <p className="text-[9px] font-bold text-sub uppercase tracking-widest mb-1">
                        Justification
                      </p>{" "}
                      <p className="text-xs font-bold text-lead dark:text-[#E5E7EB] line-clamp-2">
                        "{req.reason}"
                      </p>{" "}
                    </div>{" "}
                    <div className="flex items-center justify-between">
                      {" "}
                      <div className="flex items-center gap-3">
                        {" "}
                        <div className="w-8 h-8 rounded-xl bg-[#005DAB]/10 flex items-center justify-center">
                          {" "}
                          <Clock className="w-4 h-4 text-[#005DAB]" />{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <p className="text-[8px] font-bold text-sub uppercase tracking-[0.2em]">
                            Duration
                          </p>{" "}
                          <p className="text-[10px] font-bold text-lead dark:text-[#E5E7EB] uppercase">
                            {req.requestedDuration} Hours
                          </p>{" "}
                        </div>{" "}
                      </div>{" "}
                      <span className="text-[9px] font-bold text-sub uppercase">
                        {" "}
                        {new Date(req.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </motion.div>
              ))}{" "}
            </AnimatePresence>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Request Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showRequestModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {" "}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => !requestLoading && setShowRequestModal(false)}
            />{" "}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative bg-white dark:bg-[#111827] p-10 rounded-[3rem] border border-[#E5E5EA] dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-xl w-full overflow-hidden"
            >
              {" "}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#005DAB] to-[#007AFF] opacity-80" />{" "}
              <div className="flex justify-between items-start mb-10">
                {" "}
                <div>
                  {" "}
                  <h3 className="text-3xl font-bold uppercase tracking-tight flex items-center">
                    {" "}
                    <div className="w-10 h-10 bg-[#005DAB]/10 rounded-xl flex items-center justify-center mr-4">
                      {" "}
                      <ShieldCheck className="w-6 h-6 text-[#005DAB]" />{" "}
                    </div>{" "}
                    <span className="text-[#005DAB]">Permit</span>{" "}
                    <span className="text-[#FFD100] ml-2">Request</span>{" "}
                  </h3>{" "}
                  <p className="text-sub font-bold text-[10px] uppercase tracking-widest mt-2 ml-14">
                    Duty authorization protocol v2.0
                  </p>{" "}
                </div>{" "}
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-3 text-sub hover:text-[#FF3B30] transition-colors rounded-full hover:bg-red-50"
                >
                  {" "}
                  <X className="w-6 h-6" />{" "}
                </button>{" "}
              </div>{" "}
              <div className="space-y-8">
                {" "}
                <div className="grid grid-cols-2 gap-6">
                  {" "}
                  <div className="space-y-2">
                    {" "}
                    <label className="text-[10px] font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-widest ml-1">
                      Session Duration
                    </label>{" "}
                    <div className="grid grid-cols-3 p-1.5 bg-[#F2F2F7] dark:bg-[#0B1120] rounded-2xl border border-[#E5E5EA] dark:border-white/10 shadow-inner">
                      {" "}
                      {["1", "2", "4"].map((val) => (
                        <button
                          key={val}
                          onClick={() => setRequestDuration(val)}
                          className={`py-2.5 rounded-xl text-[10px] font-bold transition-all ${requestDuration === val ? "bg-white dark:bg-[#111827] text-[#005DAB] shadow-md" : "text-sub"}`}
                        >
                          {" "}
                          {val}H{" "}
                        </button>
                      ))}{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="space-y-2">
                    {" "}
                    <label className="text-[10px] font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-widest ml-1">
                      Permit Target
                    </label>{" "}
                    <div className="grid grid-cols-2 p-1.5 bg-[#F2F2F7] dark:bg-[#0B1120] rounded-2xl border border-[#E5E5EA] dark:border-white/10 shadow-inner">
                      {" "}
                      <button
                        onClick={() => setRequestMode("personal")}
                        className={`py-2.5 rounded-xl text-[9px] font-bold transition-all flex items-center justify-center gap-2 ${requestMode === "personal" ? "bg-[#005DAB] text-white shadow-md" : "text-sub"}`}
                      >
                        {" "}
                        <UserPlus className="w-3 h-3" /> Personal{" "}
                      </button>{" "}
                      <button
                        onClick={() => setRequestMode("office")}
                        className={`py-2.5 rounded-xl text-[9px] font-bold transition-all flex items-center justify-center gap-2 ${requestMode === "office" ? "bg-[#005DAB] text-white shadow-md" : "text-sub"}`}
                      >
                        {" "}
                        <FileText className="w-3 h-3" /> Office Work{" "}
                      </button>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="relative">
                  {" "}
                  <label className="text-[10px] font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-widest ml-1">
                    Operational Justification
                  </label>{" "}
                  <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="Please provide a specific reason for this request..."
                    className="w-full mt-2 p-6 rounded-3xl bg-[#F2F2F7] dark:bg-[#0B1120] border-none outline-none focus:ring-4 focus:ring-[#005DAB]/10 text-xs font-bold uppercase tracking-tight min-h-[120px] shadow-inner transition-all placeholder:opacity-30"
                  />{" "}
                </div>{" "}
                <div className="flex gap-4 pt-4">
                  {" "}
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 py-5 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] text-lead dark:text-[#E5E7EB] font-bold uppercase text-xs tracking-widest hover:bg-[#E5E5EA] transition-colors"
                  >
                    {" "}
                    Abort{" "}
                  </button>{" "}
                  <button
                    onClick={handleSubmitRequest}
                    disabled={requestLoading}
                    className="flex-[2] py-5 rounded-2xl bg-gradient-to-tr from-[#005DAB] to-[#007AFF] text-white font-bold uppercase text-xs tracking-[0.2em] shadow-2xl shadow-[#005DAB]/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {" "}
                    {requestLoading ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {" "}
                        <ArrowRight className="w-4 h-4" /> Transmit Request{" "}
                      </>
                    )}{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
              <div className="mt-8 text-center text-sub text-[8px] font-bold uppercase tracking-[0.3em] opacity-40">
                {" "}
                Forge India Security Protocol v2.0 â€¢ Request ID:{" "}
                {Date.now().toString().slice(-8)}{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default DutyPermissions;
