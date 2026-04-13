import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  ClipboardList, Plus, Pencil, Trash2, X, Loader2,
  AlertTriangle, Clock, CheckCircle2, Activity, Filter, Calendar, ChevronDown
} from "lucide-react";

const API = "/api/tl";

const PRIORITY_META = {
  critical: { label: "Critical", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" },
  high:     { label: "High",     cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
  medium:   { label: "Medium",   cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  low:      { label: "Low",      cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700" },
};

const STATUS_META = {
  pending:     { label: "Pending",     cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
  "in-progress": { label: "In Progress", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Activity },
  review:      { label: "Review",      cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: AlertTriangle },
  completed:   { label: "Completed",   cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
};

const Modal = ({ onClose, title, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-[#E5E5EA] dark:border-white/10 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-black uppercase tracking-widest text-[#1C1C1E] dark:text-white">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F2F2F7] dark:hover:bg-[#0B1120] text-[#6E6E73] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[10px] font-black uppercase tracking-widest text-[#6E6E73] dark:text-[#9CA3AF] mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2.5 text-sm bg-[#F5F5F7] dark:bg-[#0B1120] border border-[#E5E5EA] dark:border-white/10 rounded-xl text-[#1C1C1E] dark:text-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#005DAB]/40 transition-all";
const selectCls = `${inputCls} cursor-pointer`;

export default function TLTasks() {
  const { token } = useSelector((s) => s.auth);
  const headers = { Authorization: `Bearer ${token}` };

  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "all", priority: "all", agentId: "all" });
  const [form, setForm] = useState({
    assignedTo: "", title: "", description: "", priority: "medium", deadline: "", status: "pending"
  });

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.priority !== "all") params.set("priority", filters.priority);
    if (filters.agentId !== "all") params.set("agentId", filters.agentId);

    Promise.all([
      axios.get(`${API}/tasks?${params}`, { headers }),
      axios.get(`${API}/agents`, { headers }),
    ])
      .then(([t, a]) => { setTasks(t.data); setAgents(a.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ assignedTo: "", title: "", description: "", priority: "medium", deadline: "", status: "pending" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditing(task);
    setForm({
      assignedTo: task.assignedTo?._id || "",
      title: task.title,
      description: task.description,
      priority: task.priority || "medium",
      deadline: task.deadline ? task.deadline.split("T")[0] : "",
      status: task.status,
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setError("");
    if (!form.assignedTo || !form.title || !form.description)
      return setError("Agent, title, and description are required.");
    setSaving(true);
    try {
      const payload = {
        assignedTo: form.assignedTo,
        title: form.title,
        description: form.description,
        priority: form.priority,
        deadline: form.deadline || null,
        status: form.status,
      };
      if (editing) {
        await axios.put(`${API}/task/${editing._id}`, payload, { headers });
      } else {
        await axios.post(`${API}/tasks`, payload, { headers });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(`${API}/task/${id}`, { headers });
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const updated = await axios.put(`${API}/task/${task._id}`, { status: newStatus }, { headers });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated.data : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const isOverdue = (task) =>
    task.deadline && task.status !== "completed" && new Date(task.deadline) < new Date();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest flex items-center gap-2">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Task</span>
            <span className="text-[#FFD100]">Board</span>
          </h1>
          <p className="text-xs text-[#6E6E73] dark:text-[#9CA3AF] mt-1 font-medium">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#005DAB] to-[#007AFF] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-[#005DAB]/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-[#E5E5EA] dark:border-white/10 shadow-sm flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className={selectCls + " w-auto text-xs"}>
          <option value="all">All Status</option>
          {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className={selectCls + " w-auto text-xs"}>
          <option value="all">All Priority</option>
          {Object.keys(PRIORITY_META).map((p) => <option key={p} value={p}>{PRIORITY_META[p].label}</option>)}
        </select>
        <select value={filters.agentId} onChange={(e) => setFilters({ ...filters, agentId: e.target.value })}
          className={selectCls + " w-auto text-xs"}>
          <option value="all">All Agents</option>
          {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
      </div>

      {/* Tasks */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#005DAB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-16 border border-[#E5E5EA] dark:border-white/10 flex flex-col items-center">
          <ClipboardList className="w-12 h-12 text-[#E5E5EA] dark:text-white/10 mb-4" />
          <p className="text-sm font-bold text-[#6E6E73]">No tasks found</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Create a task or adjust your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const pm = PRIORITY_META[task.priority] || PRIORITY_META.medium;
            const sm = STATUS_META[task.status] || STATUS_META.pending;
            const StatusIcon = sm.icon;
            const overdue = isOverdue(task);
            return (
              <div
                key={task._id}
                className={`bg-white dark:bg-[#111827] rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all duration-200 group ${overdue ? "border-red-300 dark:border-red-700" : "border-[#E5E5EA] dark:border-white/10"}`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${pm.cls}`}>
                      {pm.label}
                    </span>
                    {overdue && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <AlertTriangle className="w-2.5 h-2.5" /> Overdue
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg hover:bg-[#F2F2F7] dark:hover:bg-[#0B1120] text-[#005DAB] dark:text-[#5AC8FA] transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(task._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & desc */}
                <h3 className="font-black text-sm text-[#1C1C1E] dark:text-white mb-1 leading-snug">{task.title}</h3>
                <p className="text-xs text-[#6E6E73] dark:text-[#9CA3AF] line-clamp-2 mb-3">{task.description}</p>

                {/* Footer */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#005DAB] to-[#007AFF] flex items-center justify-center text-white text-[9px] font-black">
                      {task.assignedTo?.name?.[0] || "?"}
                    </div>
                    <span className="text-[10px] font-bold text-[#6E6E73] dark:text-[#9CA3AF]">{task.assignedTo?.name || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.deadline && (
                      <span className={`flex items-center gap-1 text-[10px] font-bold ${overdue ? "text-red-500" : "text-[#6E6E73] dark:text-[#9CA3AF]"}`}>
                        <Calendar className="w-3 h-3" />
                        {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    )}
                    {/* Quick status change */}
                    <div className="relative">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value)}
                        className={`text-[9px] font-black uppercase pl-2 pr-5 py-1 rounded-lg border-0 cursor-pointer appearance-none ${sm.cls}`}
                      >
                        {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editing ? "Edit Task" : "Create Task"}>
          <div className="space-y-4">
            <Field label="Assign To Agent">
              <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className={selectCls}>
                <option value="">Select an agent…</option>
                {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </Field>
            <Field label="Task Title">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Follow-up with 10 leads" className={inputCls} />
            </Field>
            <Field label="Description">
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Task details…" rows={3} className={inputCls + " resize-none"} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Priority">
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={selectCls}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectCls}>
                  {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Deadline (optional)">
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={inputCls} />
            </Field>
            {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-[#E5E5EA] dark:border-white/10 text-xs font-black uppercase tracking-widest text-[#6E6E73] hover:bg-[#F5F5F7] dark:hover:bg-[#0B1120] transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#005DAB] to-[#007AFF] text-white text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-[#005DAB]/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editing ? "Update Task" : "Create Task"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
