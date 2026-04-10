import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PhoneCall,
  Search,
  MessageSquare,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
const AdminCalls = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchCalls();
  }, []);
  const fetchCalls = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/calls", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCalls(data);
    } catch (err) {
      console.error("Failed to fetch calls");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {" "}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {" "}
        <div>
          {" "}
          <h2 className="text-3xl font-bold uppercase tracking-tight ">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Call</span>{" "}
            <span className="text-[#FFD100]">Monitoring</span>
          </h2>{" "}
          <p className="text-sub dark:text-[#E5E7EB]/60 font-bold text-xs uppercase tracking-widest mt-1">
            Review and analyze agent interaction with leads
          </p>{" "}
        </div>{" "}
        <div className="flex items-center gap-3">
          {" "}
          <button className="bg-white dark:bg-[#111827] px-6 py-3 rounded-2xl border border-[#E5E5EA] dark:border-white/10 shadow-sm text-[10px] font-bold uppercase tracking-widest text-lead dark:text-[#E5E7EB] flex items-center hover:bg-[#F2F2F7] dark:hover:bg-white/5 transition-all">
            {" "}
            <Download className="w-4 h-4 mr-2 text-[#005DAB] dark:text-[#5AC8FA]" />{" "}
            Report{" "}
          </button>{" "}
          <div className="bg-[#005DAB] px-6 py-3 rounded-2xl text-white text-[10px] font-bold uppercase tracking-widest flex items-center shadow-xl shadow-[#005DAB]/20 hover:scale-105 transition-all cursor-pointer">
            {" "}
            <TrendingUp className="w-4 h-4 mr-2 text-[#FFD100]" /> Live
            Stats{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-[#E5E5EA] dark:border-white/10 shadow-2xl overflow-hidden">
        {" "}
        <div className="p-6 border-b border-[#E5E5EA] dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F9F9FB] dark:bg-[#111827]">
          {" "}
          <div className="relative w-full md:w-96 group">
            {" "}
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sub group-focus-within:text-[#005DAB] transition-colors" />{" "}
            <input
              placeholder="Filter by agent or lead..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-[#0B1120] border-2 border-transparent outline-none focus:border-[#005DAB] dark:focus:border-[#5AC8FA] transition-all text-lead dark:text-[#E5E7EB] font-bold text-sm shadow-sm"
            />{" "}
          </div>{" "}
          <div className="flex bg-[#F2F2F7] dark:bg-[#0B1120] p-1 rounded-xl border border-[#E5E5EA] dark:border-white/10">
            {" "}
            <button className="px-6 py-2 rounded-lg bg-white dark:bg-[#111827] shadow-sm text-[10px] font-bold uppercase text-[#005DAB] dark:text-[#5AC8FA] tracking-widest">
              Logs
            </button>{" "}
          </div>{" "}
        </div>{" "}
        <div className="overflow-x-auto">
          {" "}
          <table className="w-full">
            {" "}
            <thead>
              {" "}
              <tr className="bg-white dark:bg-[#111827] text-left">
                {" "}
                <th className="px-8 py-6 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">
                  Agent Detail
                </th>{" "}
                <th className="px-8 py-6 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">
                  Lead Identity
                </th>{" "}
                <th className="px-8 py-6 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">
                  Outcome
                </th>{" "}
                <th className="px-8 py-6 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">
                  Internal Remarks
                </th>{" "}
                <th className="px-8 py-6 text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest text-right">
                  Synchronization
                </th>{" "}
              </tr>{" "}
            </thead>{" "}
            <tbody className="divide-y divide-[#E5E5EA] dark:divide-white/5 bg-white dark:bg-[#111827]">
              {" "}
              {calls.length > 0 ? (
                calls.map((call) => (
                  <tr
                    key={call._id}
                    className="hover:bg-[#F2F2F7]/50 dark:hover:bg-white/5 transition-all group"
                  >
                    {" "}
                    <td className="px-8 py-5 whitespace-nowrap">
                      {" "}
                      <div className="flex items-center">
                        {" "}
                        <div className="w-10 h-10 rounded-2xl bg-[#005DAB]/10 dark:bg-[#005DAB]/20 flex items-center justify-center text-[#005DAB] dark:text-[#5AC8FA] font-bold mr-4 text-xs">
                          {" "}
                          {call.sellerId?.name?.charAt(0) || "A"}{" "}
                        </div>{" "}
                        <span className="text-sm font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight ">
                          {call.sellerId?.name}
                        </span>{" "}
                      </div>{" "}
                    </td>{" "}
                    <td className="px-8 py-5 whitespace-nowrap">
                      {" "}
                      <div className="text-sm font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight">
                        {call.leadId?.name}
                      </div>{" "}
                      <div className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">
                        {call.leadId?.phone}
                      </div>{" "}
                    </td>{" "}
                    <td className="px-8 py-5 whitespace-nowrap">
                      {" "}
                      <span
                        className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${call.callStatus === "interested" ? "bg-[#34C759]/10 text-[#34C759] border-[#34C759]/10" : call.callStatus === "busy" ? "bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/10" : "bg-[#005DAB]/10 text-[#005DAB] border-[#005DAB]/10"}`}
                      >
                        {" "}
                        {call.callStatus}{" "}
                      </span>{" "}
                    </td>{" "}
                    <td className="px-8 py-5 max-w-xs">
                      {" "}
                      <p className="text-xs font-bold text-lead dark:text-[#E5E7EB] line-clamp-1 group-hover:line-clamp-none transition-all">
                        {call.notes || "No notes available"}
                      </p>{" "}
                    </td>{" "}
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      {" "}
                      <p className="text-[10px] font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-widest mb-1">
                        {" "}
                        {new Date(call.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                      </p>{" "}
                      <p className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">
                        {" "}
                        {new Date(call.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                      </p>{" "}
                    </td>{" "}
                  </tr>
                ))
              ) : (
                <tr>
                  {" "}
                  <td colSpan="5" className="px-8 py-24 text-center">
                    {" "}
                    <div className="w-20 h-20 bg-[#F2F2F7] dark:bg-[#0B1120] rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-[#E5E5EA] dark:border-white/10 shadow-inner">
                      {" "}
                      <PhoneCall className="w-10 h-10 text-sub dark:text-[#E5E7EB]/20 opacity-30" />{" "}
                    </div>{" "}
                    <h3 className="text-xl font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight">
                      No Call Data
                    </h3>{" "}
                    <p className="text-sub dark:text-[#E5E7EB]/40 text-[10px] font-bold uppercase tracking-widest mt-2">
                      {loading
                        ? "Synthesizing..."
                        : "No agent interactions found"}
                    </p>{" "}
                  </td>{" "}
                </tr>
              )}{" "}
            </tbody>{" "}
          </table>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default AdminCalls;
