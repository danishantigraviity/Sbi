import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ShieldCheck,
  XCircle,
  Clock,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
const WorkPermissions = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchRequests = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const { data } = await axios.get("/api/work/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(data);
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error("Failed to sync permission requests");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);
  const handleAction = async (requestId, status) => {
    try {
      await axios.post(
        "/api/work/handle",
        { requestId, status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success(
        `Request ${status === "approved" ? "authorized" : "declined"} successfully`,
      );
      fetchRequests();
    } catch (err) {
      toast.error("Failed to process request");
    }
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
            Real-time authorization of personal work segments
          </p>{" "}
        </div>{" "}
        <button
          onClick={fetchRequests}
          className="flex items-center px-6 py-3 rounded-2xl bg-white dark:bg-[#111827] text-lead dark:text-[#E5E7EB] font-bold uppercase text-[10px] tracking-widest border border-[#E5E5EA] dark:border-white/10 shadow-sm"
        >
          {" "}
          <RefreshCw
            className={`w-4 h-4 mr-3 text-[#005DAB] ${loading ? "animate-spin" : ""}`}
          />{" "}
          Refresh Feed{" "}
        </button>{" "}
      </div>{" "}
      <div className="bg-white dark:bg-[#111827] rounded-[3rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl overflow-hidden min-h-[400px]">
        {" "}
        {loading && requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            {" "}
            <div className="w-12 h-12 border-4 border-[#005DAB]/10 border-t-[#005DAB] rounded-full animate-spin" />{" "}
            <p className="text-[10px] font-bold text-sub uppercase tracking-widest">
              Scanning network for requests...
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
              Zero Pending
            </h3>{" "}
            <p className="text-sub text-[10px] font-bold uppercase tracking-widest">
              All agents are currently synchronized and on duty
            </p>{" "}
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {" "}
            <AnimatePresence>
              {" "}
              {requests.map((req) => (
                <motion.div
                  key={req._id}
                  layoutId={req._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#F9F9FB] dark:bg-[#0B1120] p-8 rounded-[2.5rem] border border-[#E5E5EA] dark:border-white/5 relative group"
                >
                  {" "}
                  <div className="flex justify-between items-start mb-6">
                    {" "}
                    <div className="flex items-center gap-4">
                      {" "}
                      <div className="w-12 h-12 rounded-2xl bg-[#005DAB] flex items-center justify-center text-white font-bold text-xl">
                        {" "}
                        {req.sellerId?.name?.[0]}{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <h4 className="text-sm font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight ">
                          {req.sellerId?.name}
                        </h4>{" "}
                        <p className="text-[10px] font-bold text-sub uppercase tracking-widest">
                          Request: Personal Mode
                        </p>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="px-3 py-1 bg-[#FFD100]/20 text-[#FFD100] rounded-full text-[8px] font-bold uppercase tracking-widest border border-[#FFD100]/30 animate-pulse">
                      {" "}
                      Pending{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="p-6 bg-white dark:bg-[#111827] rounded-3xl border border-[#E5E5EA] dark:border-white/10 mb-8 space-y-4">
                    {" "}
                    <div className="flex items-start gap-4">
                      {" "}
                      <FileText className="w-5 h-5 text-[#005DAB] mt-1 shrink-0" />{" "}
                      <div>
                        {" "}
                        <p className="text-[10px] font-bold text-sub uppercase tracking-widest mb-1">
                          Justification Reason
                        </p>{" "}
                        <p className="text-sm font-bold text-lead dark:text-[#E5E7EB] leading-relaxed">
                          "{req.reason}"
                        </p>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="flex items-center gap-4 pt-4 border-t border-[#F2F2F7] dark:border-white/5">
                      {" "}
                      <Clock className="w-5 h-5 text-sub shrink-0" />{" "}
                      <div>
                        {" "}
                        <p className="text-[10px] font-bold text-sub uppercase tracking-widest">
                          Timestamp
                        </p>{" "}
                        <p className="text-[10px] font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-widest">
                          {" "}
                          {new Date(req.startTime).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}{" "}
                        </p>{" "}
                      </div>{" "}
                    </div>{" "}
                    {req.requestedDuration && (
                      <div className="flex items-center gap-4 pt-4 border-t border-[#F2F2F7] dark:border-white/5">
                        {" "}
                        <div className="w-5 h-5 bg-[#FFD100]/10 rounded-lg flex items-center justify-center shrink-0">
                          {" "}
                          <Clock className="w-3.5 h-3.5 text-[#FFD100]" />{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <p className="text-[10px] font-bold text-sub uppercase tracking-widest">
                            Requested Duration
                          </p>{" "}
                          <p className="text-[11px] font-bold text-[#005DAB] dark:text-[#5AC8FA] uppercase tracking-widest ">
                            {" "}
                            {req.requestedDuration} Hours Segment{" "}
                          </p>{" "}
                        </div>{" "}
                      </div>
                    )}{" "}
                  </div>{" "}
                  <div className="flex gap-4">
                    {" "}
                    <button
                      onClick={() => handleAction(req._id, "rejected")}
                      className="flex-1 py-4 rounded-2xl bg-white dark:bg-[#111827] text-[#FF3B30] border border-red-100 dark:border-red-900/20 font-bold uppercase text-[10px] tracking-widest hover:bg-[#FF3B30] hover:text-white transition-all shadow-sm"
                    >
                      {" "}
                      Denial{" "}
                    </button>{" "}
                    <button
                      onClick={() => handleAction(req._id, "approved")}
                      className="flex-1 py-4 rounded-2xl bg-[#34C759] text-white font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-[#34C759]/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      {" "}
                      Authorize{" "}
                    </button>{" "}
                  </div>{" "}
                </motion.div>
              ))}{" "}
            </AnimatePresence>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};
export default WorkPermissions;
