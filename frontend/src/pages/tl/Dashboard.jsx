import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Users,
  ClipboardList,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Activity,
} from "lucide-react";

const API = "/api/tl";

const StatCard = ({ icon: Icon, label, value, sub, color, gradient }) => (
  <div className={`relative bg-white dark:bg-[#111827] rounded-2xl p-5 border border-[#E5E5EA] dark:border-white/10 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300`}>
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient}`} />
    <div className="relative z-10">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-black text-[#1C1C1E] dark:text-white">{value ?? "—"}</p>
      <p className="text-xs font-bold uppercase tracking-widest text-[#6E6E73] dark:text-[#9CA3AF] mt-1">{label}</p>
      {sub && <p className="text-[10px] text-[#005DAB] dark:text-[#5AC8FA] font-semibold mt-1">{sub}</p>}
    </div>
  </div>
);

const statusColors = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  review: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function TLDashboard() {
  const { token } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API}/stats`, { headers })
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#005DAB] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#6E6E73]">Loading Dashboard…</p>
        </div>
      </div>
    );
  }

  const taskStatusMap = {};
  (stats?.taskStatusBreakdown || []).forEach((b) => { taskStatusMap[b._id] = b.count; });
  const taskPriorityMap = {};
  (stats?.taskPriorityBreakdown || []).forEach((b) => { taskPriorityMap[b._id] = b.count; });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-widest text-[#1C1C1E] dark:text-white flex items-center gap-2">
          <span className="text-[#005DAB] dark:text-[#5AC8FA]">Team</span>
          <span className="text-[#FFD100]">Overview</span>
        </h1>
        <p className="text-xs text-[#6E6E73] dark:text-[#9CA3AF] mt-1 font-medium">
          Real-time metrics for your team's performance
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users} label="Total Agents" value={stats?.totalAgents}
          color="bg-gradient-to-br from-[#005DAB] to-[#007AFF]"
          gradient="bg-gradient-to-br from-[#005DAB]/5 to-transparent"
        />
        <StatCard
          icon={ClipboardList} label="Total Tasks" value={stats?.totalTasks}
          sub={`${stats?.completedTasks} completed`}
          color="bg-gradient-to-br from-purple-500 to-purple-700"
          gradient="bg-gradient-to-br from-purple-500/5 to-transparent"
        />
        <StatCard
          icon={Target} label="Total Leads" value={stats?.totalLeads}
          sub={`${stats?.openLeads} open`}
          color="bg-gradient-to-br from-emerald-500 to-emerald-700"
          gradient="bg-gradient-to-br from-emerald-500/5 to-transparent"
        />
        <StatCard
          icon={TrendingUp} label="Completion Rate" value={`${stats?.completionRate}%`}
          sub={`${stats?.convertedLeads} leads converted`}
          color="bg-gradient-to-br from-[#FFD100] to-amber-600"
          gradient="bg-gradient-to-br from-amber-500/5 to-transparent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Breakdown */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E5E5EA] dark:border-white/10 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#1C1C1E] dark:text-white mb-5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#005DAB] dark:text-[#5AC8FA]" />
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Task</span>
            <span className="text-[#FFD100]">Breakdown</span>
          </h2>
          <div className="space-y-3">
            {[
              { key: "pending", label: "Pending", icon: Clock, bar: "bg-amber-400" },
              { key: "in-progress", label: "In Progress", icon: Activity, bar: "bg-blue-500" },
              { key: "review", label: "In Review", icon: AlertTriangle, bar: "bg-purple-500" },
              { key: "completed", label: "Completed", icon: CheckCircle2, bar: "bg-emerald-500" },
            ].map(({ key, label, bar }) => {
              const count = taskStatusMap[key] || 0;
              const pct = stats?.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#6E6E73] dark:text-[#9CA3AF]">{label}</span>
                    <span className="text-xs font-black text-[#1C1C1E] dark:text-white">{count}</span>
                  </div>
                  <div className="h-2 bg-[#F2F2F7] dark:bg-[#0B1120] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${bar} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Priority breakdown */}
          <div className="mt-6 pt-5 border-t border-[#E5E5EA] dark:border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#6E6E73] mb-3">Priority Split</p>
            <div className="flex flex-wrap gap-2">
              {["critical", "high", "medium", "low"].map((p) => (
                <span key={p} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${priorityColors[p]}`}>
                  {p} · {taskPriorityMap[p] || 0}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E5E5EA] dark:border-white/10 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#1C1C1E] dark:text-white mb-5 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#005DAB] dark:text-[#5AC8FA]" />
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Agent</span>
            <span className="text-[#FFD100]">Performance</span>
          </h2>
          {(!stats?.agentPerformance || stats.agentPerformance.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="w-10 h-10 text-[#E5E5EA] dark:text-white/10 mb-3" />
              <p className="text-xs font-bold text-[#9CA3AF]">No agents in your team yet</p>
              <p className="text-[10px] text-[#9CA3AF] mt-1">Add agents from the My Agents page</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.agentPerformance.map((agent) => (
                <div key={agent.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F2F2F7] dark:hover:bg-[#0B1120] transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#005DAB] to-[#007AFF] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {agent.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-[#1C1C1E] dark:text-white truncate">{agent.name}</p>
                    <p className="text-[10px] text-[#6E6E73] dark:text-[#9CA3AF] truncate">{agent.email}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-[#6E6E73] dark:text-[#9CA3AF]">{agent.completed}/{agent.assigned} tasks</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">{agent.leads} leads</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className={`text-sm font-black ${agent.rate >= 75 ? "text-emerald-600 dark:text-emerald-400" : agent.rate >= 40 ? "text-amber-600 dark:text-amber-400" : "text-red-500"}`}>
                      {agent.rate}%
                    </span>
                    <p className="text-[9px] text-[#9CA3AF] uppercase tracking-widest">rate</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E5E5EA] dark:border-white/10 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#1C1C1E] dark:text-white mb-5 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#005DAB] dark:text-[#5AC8FA]" />
          <span className="text-[#005DAB] dark:text-[#5AC8FA]">Recent</span>
          <span className="text-[#FFD100]">Tasks</span>
        </h2>
        {(!stats?.recentTasks || stats.recentTasks.length === 0) ? (
          <p className="text-xs text-[#9CA3AF] text-center py-8">No tasks created yet</p>
        ) : (
          <div className="divide-y divide-[#F2F2F7] dark:divide-white/5">
            {stats.recentTasks.map((task) => (
              <div key={task._id} className="flex items-center gap-4 py-3 group">
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${statusColors[task.status]}`}>
                  {task.status}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1C1C1E] dark:text-white truncate">{task.title}</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">→ {task.assignedTo?.name || "Unknown Agent"}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
                {task.deadline && (
                  <span className="text-[10px] text-[#6E6E73] dark:text-[#9CA3AF] flex-shrink-0">
                    {new Date(task.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
