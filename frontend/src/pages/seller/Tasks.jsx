import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Award,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
const SellerTasks = () => {
  const { user } = useSelector((state) => state.auth);
  const isPersonal = user?.workMode === "personal";
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await axios.get("/api/seller/tasks", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTasks(data || []);
      } catch (err) {
        console.error("Fetch tasks error");
      }
    };
    fetchTasks();
  }, []);
  const handleCompleteTask = async (taskId) => {
    try {
      await axios.put(
        `/api/seller/tasks/${taskId}/status`,
        { status: "completed" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success("Task synchronization successful");
      setTasks(
        tasks.map((t) =>
          t._id === taskId ? { ...t, status: "completed" } : t,
        ),
      );
    } catch (err) {
      toast.error("Failed to sync task status");
    }
  };
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {" "}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {" "}
        <div>
          {" "}
          <h2 className="text-3xl font-bold uppercase tracking-tight ">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Mission</span>{" "}
            <span className="text-[#FFD100]">Objectives</span>
          </h2>{" "}
          <p className="text-sub dark:text-[#E5E7EB]/60 font-medium text-xs uppercase tracking-widest mt-1">
            Daily tasks and operational goals from centralized management
          </p>{" "}
        </div>{" "}
        <div className="flex bg-[#F2F2F7] dark:bg-[#111827] p-1.5 rounded-2xl border border-[#E5E5EA] dark:border-white/10 shadow-inner">
          {" "}
          <button className="px-6 py-3 rounded-xl bg-[#005DAB] text-white font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-[#005DAB]/20 transition-all">
            Active Duty
          </button>{" "}
          <button className="px-6 py-3 rounded-xl text-sub dark:text-[#E5E7EB]/40 font-bold text-[10px] uppercase tracking-widest hover:text-lead dark:hover:text-[#E5E7EB] transition-all">
            Archived
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <AnimatePresence>
        {" "}
        {isPersonal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-[#FF3B30]/5 border-2 border-dashed border-[#FF3B30]/20 p-10 rounded-[3rem] text-center mb-8"
          >
            {" "}
            <div className="w-20 h-20 bg-[#FF3B30]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              {" "}
              <AlertCircle className="w-10 h-10 text-[#FF3B30]" />{" "}
            </div>{" "}
            <h3 className="text-2xl font-bold text-[#FF3B30] uppercase tracking-tight ">
              Personal Mode Active
            </h3>{" "}
            <p className="text-sub text-xs font-bold uppercase tracking-widest mt-2 max-w-md mx-auto leading-relaxed">
              {" "}
              Task synchronization and completion logs are currently locked.
              Please return to Company Duty to resume mission objectives.{" "}
            </p>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
      <div
        className={`grid grid-cols-1 lg:grid-cols-4 gap-8 ${isPersonal ? "opacity-40 pointer-events-none" : ""}`}
      >
        {" "}
        <div className="lg:col-span-3 space-y-6">
          {" "}
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#111827] p-8 rounded-[3rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl group hover:border-[#005DAB]/30 transition-all relative overflow-hidden"
              >
                {" "}
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  {" "}
                  <div className="flex-1">
                    {" "}
                    <div className="flex items-center gap-4 mb-4">
                      {" "}
                      <span
                        className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${task.status === "completed" ? "bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20 shadow-[0_0_10px_rgba(52,199,89,0.1)]" : "bg-[#FFD100]/10 text-lead dark:text-[#FFD100] border-[#FFD100]/20"}`}
                      >
                        {" "}
                        {task.status}{" "}
                      </span>{" "}
                      <span className="text-[9px] font-bold uppercase tracking-widest text-sub dark:text-[#E5E7EB]/30 flex items-center">
                        {" "}
                        <Clock className="w-3 h-3 mr-2 text-[#005DAB] dark:text-[#5AC8FA]" />{" "}
                        Timeline: Immediate Objective{" "}
                      </span>{" "}
                    </div>{" "}
                    <h3 className="text-2xl font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight mb-3 border-b border-[#E5E5EA] dark:border-white/5 pb-2 inline-block shadow-[0_4px_0_-2px_#FFD100]">
                      {task.title}
                    </h3>{" "}
                    <p className="text-sub dark:text-[#E5E7EB]/40 font-bold text-sm leading-relaxed mb-8 ">
                      "{task.description}"
                    </p>{" "}
                    <div className="flex flex-wrap items-center gap-8">
                      {" "}
                      <div className="flex items-center text-[10px] font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-widest">
                        {" "}
                        <TrendingUp className="w-4 h-4 mr-3 text-[#005DAB] dark:text-[#5AC8FA]" />{" "}
                        Priority Segment{" "}
                      </div>{" "}
                      <div className="flex items-center text-[10px] font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-widest">
                        {" "}
                        <Award className="w-4 h-4 mr-3 text-[#FFD100]" />{" "}
                        Performance Asset{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="flex flex-col justify-center items-end gap-4 min-w-[200px] border-l border-[#E5E5EA] dark:border-white/5 pl-8">
                    {" "}
                    {task.status !== "completed" ? (
                      <button
                        onClick={() => handleCompleteTask(task._id)}
                        disabled={isPersonal}
                        className="w-full py-5 rounded-[1.5rem] bg-[#005DAB] text-white shadow-xl shadow-[#005DAB]/20 font-bold uppercase text-[10px] tracking-widest flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {" "}
                        Log Completion{" "}
                        <ChevronRight className="w-4 h-4 ml-3" />{" "}
                      </button>
                    ) : (
                      <div className="w-full py-5 rounded-[1.5rem] bg-[#34C759]/10 text-[#34C759] font-bold uppercase text-[10px] tracking-widest flex items-center justify-center border border-[#34C759]/20 shadow-[0_0_15px_rgba(52,199,89,0.1)]">
                        {" "}
                        <CheckCircle2 className="w-4 h-4 mr-3" /> Verified
                        Done{" "}
                      </div>
                    )}{" "}
                    <button className="w-full py-4 rounded-[1.5rem] bg-[#F2F2F7] dark:bg-[#0B1120] text-sub dark:text-[#E5E7EB]/20 font-bold uppercase text-[9px] tracking-widest hover:text-lead dark:hover:text-[#E5E7EB] transition-all ">
                      {" "}
                      Flag Sync Error{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
              </motion.div>
            ))
          ) : (
            <div className="py-32 text-center bg-white dark:bg-[#111827] rounded-[3.5rem] border-2 border-dashed border-[#E5E5EA] dark:border-white/5 shadow-inner">
              {" "}
              <div className="w-24 h-24 bg-[#F2F2F7] dark:bg-[#0B1120] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
                {" "}
                <ClipboardList className="w-12 h-12 text-sub dark:text-[#E5E7EB]/20 opacity-30" />{" "}
              </div>{" "}
              <h3 className="text-2xl font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight ">
                Queue Synchronized
              </h3>{" "}
              <p className="text-sub dark:text-[#E5E7EB]/40 mt-2 font-bold text-[10px] uppercase tracking-widest">
                No active mission objectives detected in your sector.
              </p>{" "}
            </div>
          )}{" "}
        </div>{" "}
        <div className="space-y-8">
          {" "}
          <div className="bg-gradient-to-br from-[#005DAB] to-[#004A89] p-8 rounded-[3rem] text-white shadow-2xl shadow-[#005DAB]/30 relative overflow-hidden group">
            {" "}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
              {" "}
              <Award className="w-32 h-32" />{" "}
            </div>{" "}
            <h4 className="text-xs font-bold uppercase tracking-widest mb-2 text-white/60">
              Operational Rank
            </h4>{" "}
            <p className="text-white font-bold text-sm leading-tight mb-8">
              You are currently leading in the top 15% of agents nationwide.
            </p>{" "}
            <div className="text-6xl font-bold mb-1 tracking-tight">98.2</div>{" "}
            <p className="text-[#FFD100] text-[9px] uppercase font-bold tracking-widest">
              Efficiency Multiplier
            </p>{" "}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              {" "}
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                Sector: North India
              </span>{" "}
              <ChevronRight className="w-4 h-4 text-[#FFD100]" />{" "}
            </div>{" "}
          </div>{" "}
          <div className="bg-white dark:bg-[#111827] p-8 rounded-[3rem] border border-[#E5E5EA] dark:border-white/10 shadow-2xl relative overflow-hidden">
            {" "}
            <h4 className="text-[10px] font-bold text-[#005DAB] dark:text-[#5AC8FA] uppercase tracking-widest mb-8 flex items-center ">
              {" "}
              <TrendingUp className="w-3.5 h-3.5 mr-2" /> Field
              Intelligence{" "}
            </h4>{" "}
            <ul className="space-y-8">
              {" "}
              {[
                "Prioritize lead synchronization before 11:00 AM.",
                "Update conversion status immediately post-interaction.",
                "Maintain punctuality to secure operational credits.",
              ].map((tip, i) => (
                <li key={i} className="flex gap-4 group">
                  {" "}
                  <div className="w-8 h-8 rounded-2xl bg-[#005DAB]/10 dark:bg-[#005DAB]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    {" "}
                    <Check className="w-4 h-4 text-[#005DAB] dark:text-[#5AC8FA]" />{" "}
                  </div>{" "}
                  <p className="text-xs text-lead dark:text-[#E5E7EB] font-bold leading-relaxed uppercase tracking-tight">
                    "{tip}"
                  </p>{" "}
                </li>
              ))}{" "}
            </ul>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default SellerTasks;
