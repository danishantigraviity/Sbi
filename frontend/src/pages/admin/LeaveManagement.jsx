import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Filter,
  MoreHorizontal,
  ChevronRight,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const AdminLeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchAllLeaves();
  }, []);

  const fetchAllLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/leaves/admin/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLeaves(data);
    } catch (err) {
      console.error("Fetch leaves error:", err);
      toast.error("Failed to sync leave registry");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (!adminNotes && status === "rejected") {
      toast.error("Feedback required for denial");
      return;
    }
    try {
      await axios.put(
        `/api/leaves/admin/update/${id}`,
        { status, adminNotes },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success(`Request ${status} successfully`);
      setSelectedLeave(null);
      setAdminNotes("");
      fetchAllLeaves();
    } catch (err) {
      toast.error("Failed to update request status");
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (filter === "all") return true;
    return leave.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight ">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Leave</span>{" "}
            <span className="text-[#FFD100]">Registry</span>
          </h2>
          <p className="text-sub dark:text-[#E5E7EB]/60 font-medium text-xs uppercase tracking-widest mt-1">
            Global management of agent presence and timeframe allocations
          </p>
        </div>
        <div className="flex p-1 bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E5EA] dark:border-white/10 shadow-sm">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                filter === f
                  ? "bg-[#005DAB] text-white shadow-lg"
                  : "text-sub hover:bg-[#F2F2F7] dark:hover:bg-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="py-24 text-center">
                <div className="w-10 h-10 border-4 border-[#005DAB]/20 border-t-[#005DAB] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-bold text-sub uppercase tracking-widest">
                  Accessing records...
                </p>
              </div>
            ) : filteredLeaves.length === 0 ? (
              <div className="py-24 text-center bg-white dark:bg-[#111827] rounded-[3rem] border border-[#E5E5EA] dark:border-white/10">
                <div className="w-20 h-20 bg-[#F2F2F7] dark:bg-[#0B1120] rounded-[2rem] flex items-center justify-center mx-auto mb-4 grayscale opacity-30">
                  <Clock className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-lead uppercase tracking-tight ">
                  Registry Clear
                </h3>
                <p className="text-sub text-[10px] font-bold uppercase tracking-widest mt-2">
                  No items match the current query
                </p>
              </div>
            ) : (
              filteredLeaves.map((leave) => (
                <motion.div
                  key={leave._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSelectedLeave(leave)}
                  className={`group p-6 rounded-[2.5rem] bg-white dark:bg-[#111827] border transition-all cursor-pointer hover:shadow-2xl ${
                    selectedLeave?._id === leave._id
                      ? "border-[#005DAB] ring-4 ring-[#005DAB]/5 shadow-2xl"
                      : "border-[#E5E5EA] dark:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#005DAB]/10 flex items-center justify-center text-[#005DAB] text-xl font-bold shadow-inner">
                        {leave.sellerId?.name?.[0]}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight">
                          {leave.sellerId?.name}
                        </h4>
                        <p className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest leading-none mt-1">
                          {leave.type} Leave Request
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-sub uppercase tracking-widest leading-none">
                          Dates
                        </p>
                        <p className="text-xs font-bold text-lead dark:text-[#E5E7EB] mt-1 ">
                          {new Date(leave.startDate).toLocaleDateString()} —{" "}
                          {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest ${getStatusColor(
                          leave.status
                        )}`}
                      >
                        {leave.status}
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-sub transition-transform group-hover:translate-x-1 ${
                          selectedLeave?._id === leave._id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Interaction Panel */}
        <div className="xl:col-span-1">
          <AnimatePresence mode="wait">
            {!selectedLeave ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-[#F2F2F7] dark:bg-[#0B1120] rounded-[3rem] border-2 border-dashed border-[#E5E5EA] dark:border-white/5"
              >
                <AlertCircle className="w-12 h-12 text-sub opacity-20 mb-4" />
                <p className="text-[10px] font-bold text-sub uppercase tracking-[0.2em] text-center ">
                  Select a request for detailed tactical evaluation
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-[#111827] rounded-[3rem] p-8 shadow-2xl border border-[#005DAB]/10 dark:border-white/10 space-y-8 sticky top-32"
              >
                <div>
                  <h3 className="text-xl font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight border-b border-[#E5E5EA] dark:border-white/5 pb-4 mb-6">
                    Evaluation Context
                  </h3>
                  <div className="space-y-4 p-6 rounded-[2rem] bg-[#F9F9FB] dark:bg-[#0B1120] border border-[#E5E5EA] dark:border-white/5 shadow-inner">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-[#005DAB] mt-1 shrink-0" />
                      <p className="text-xs text-lead dark:text-[#E5E7EB] font-bold uppercase leading-relaxed">
                        "{selectedLeave.reason}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-sub uppercase tracking-widest ml-1">
                    Administrative Feedback
                  </label>
                  <textarea
                    placeholder="Provide justification for approval/denial..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-2 border-transparent focus:border-[#005DAB] dark:focus:border-[#5AC8FA] outline-none text-xs font-bold uppercase tracking-tight text-lead dark:text-[#E5E7EB] h-32 resize-none "
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedLeave._id, "approved")
                    }
                    className="px-6 py-4 rounded-2xl bg-[#34C759] text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedLeave._id, "rejected")
                    }
                    className="px-6 py-4 rounded-2xl bg-[#005DAB] text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
                <button
                  onClick={() => setSelectedLeave(null)}
                  className="w-full py-3 text-[9px] font-bold text-sub uppercase tracking-[0.2em] hover:text-[#005DAB] transition-colors"
                >
                  Dismiss Context
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminLeaveManagement;
