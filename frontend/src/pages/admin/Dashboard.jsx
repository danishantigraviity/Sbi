import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Users,
  TrendingUp,
  PhoneCall,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Clock,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import CustomSelect from "../../components/CustomSelect";

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-[#E5E5EA] dark:border-white/10 shadow-sm"
  >
    <div className="flex justify-between items-start mb-4">
      <div
        className={`p-4 rounded-2xl bg-gradient-to-tr ${color} shadow-lg brand-glow`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <button className="p-2 text-sub hover:text-[#005DAB] transition-colors">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
    <div>
      <p className="text-sub dark:text-[#E5E7EB]/60 text-sm font-medium mb-1">
        {title}
      </p>
      <h3 className="text-3xl font-bold text-lead dark:text-[#E5E7EB] mb-2">
        {value}
      </h3>
      <div className="flex items-center text-sm">
        {trend === "up" ? (
          <span className="text-[#34C759] flex items-center font-semibold">
            <ArrowUpRight className="w-4 h-4 mr-1" /> {trendValue}
          </span>
        ) : (
          <span className="text-[#005DAB] flex items-center font-semibold">
            <ArrowDownRight className="w-4 h-4 mr-1" /> {trendValue}
          </span>
        )}
        <span className="text-sub ml-2 font-medium uppercase text-[10px] tracking-widest">
          vs last month
        </span>
      </div>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSellers: 0,
    totalLeads: 0,
    totalSales: 0,
    pendingSales: 0,
    totalConversions: 0,
    topPerformers: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("/api/admin/stats", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats");
        if (err.response?.status === 429) {
          toast.error("Dashboard metrics are temporarily offline.");
        } else if (err.response?.status !== 401 && err.response?.status !== 403) {
          toast.error("Failed to synchronize system overview.");
        }
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight ">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">System</span>{" "}
            <span className="text-[#FFD100]">Overview</span>
          </h2>
          <p className="text-sub dark:text-[#E5E7EB]/60 font-medium text-xs uppercase tracking-widest">
            Real-time performance tracking for all agents
          </p>
        </div>

        <div className="flex bg-white dark:bg-[#111827] p-1.5 rounded-2xl border border-[#E5E5EA] dark:border-white/10 shadow-inner">
          <button className="px-6 py-2 rounded-xl bg-[#005DAB] dark:bg-[#5AC8FA] text-white dark:text-[#0B1120] font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-[#005DAB]/20">
            Daily
          </button>
          <button className="px-6 py-2 rounded-xl text-sub dark:text-[#E5E7EB]/40 font-bold uppercase text-[10px] tracking-widest hover:text-[#005DAB] dark:hover:text-[#5AC8FA] transition-all">
            Weekly
          </button>
          <button className="px-6 py-2 rounded-xl text-sub dark:text-[#E5E7EB]/40 font-bold uppercase text-[10px] tracking-widest hover:text-[#005DAB] dark:hover:text-[#5AC8FA] transition-all">
            Monthly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Active Sellers"
          value={stats.totalSellers}
          icon={Users}
          trend="up"
          trendValue="+12%"
          color="from-[#005DAB] to-[#007AFF]"
        />
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={PhoneCall}
          trend="up"
          trendValue="+24%"
          color="from-[#007AFF] to-[#5AC8FA]"
        />
        <StatCard
          title="Pending Audit"
          value={stats.pendingSales}
          icon={Clock}
          trend="up"
          trendValue="Action"
          color="from-[#FFD100] to-[#FFE04D]"
        />
        <StatCard
          title="Verified Sales"
          value={stats.totalSales}
          icon={TrendingUp}
          trend="up"
          trendValue="+5%"
          color="from-[#34C759] to-[#30FBAD]"
        />
        <StatCard
          title="Conv. Rate"
          value={`${((stats.totalSales / (stats.totalLeads || 1)) * 100).toFixed(1)}%`}
          icon={Award}
          trend="up"
          trendValue="+8%"
          color="from-[#5856D6] to-[#AF52DE]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] p-8 rounded-3xl border border-[#E5E5EA] dark:border-white/10 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-[#005DAB] dark:text-[#5AC8FA] uppercase tracking-tight">
              Performance Spectrum
            </h3>
            <div className="w-48">
              <CustomSelect
                options={[{ label: "Sales Chart", value: "sales" }]}
                value="sales"
                onChange={() => {}}
                placeholder="Chart Type"
              />
            </div>
          </div>
          <div className="h-72 flex flex-col items-center justify-center bg-[#F2F2F7] dark:bg-[#0B1120] rounded-[2.5rem] border-2 border-dashed border-[#E5E5EA] dark:border-white/5">
            <TrendingUp className="w-8 h-8 text-[#005DAB]/20 dark:text-[#5AC8FA]/30 mb-4" />
            <span className="text-sub dark:text-[#E5E7EB]/20 font-bold uppercase text-[10px] tracking-widest ">
              Tactical Metrics Visualization
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-[#E5E5EA] dark:border-white/10 shadow-sm">
          <h3 className="text-xl font-bold text-[#005DAB] dark:text-[#5AC8FA] uppercase tracking-widest mb-8">
            Top Performers
          </h3>
          <div className="space-y-6">
            {stats.topPerformers?.length > 0 ? (
              stats.topPerformers.map((performer, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#F2F2F7] dark:hover:bg-[#0B1120] transition-all"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#005DAB]/5 dark:bg-[#005DAB]/20 flex items-center justify-center text-[#005DAB] dark:text-[#5AC8FA] font-bold mr-4 text-xl">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-lead dark:text-[#E5E7EB] uppercase">
                        {performer.name}
                      </p>
                      <p className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 uppercase tracking-widest">
                        {performer.sales} Verified Sales
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#34C759]">
                      ₹{(performer.sales * 2000).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-sub text-[10px] font-bold uppercase tracking-widest">
                  Awaiting Sales Data
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
