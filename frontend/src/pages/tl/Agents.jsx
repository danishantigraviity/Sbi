import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Users, Plus, Pencil, Trash2, X, Loader2, Mail, Phone, User } from "lucide-react";

const API = "/api/tl";

const Modal = ({ onClose, title, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-[#E5E5EA] dark:border-white/10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-black uppercase tracking-widest text-[#1C1C1E] dark:text-white">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[#F2F2F7] dark:hover:bg-[#0B1120] text-[#6E6E73] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const InputField = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="block text-[10px] font-black uppercase tracking-widest text-[#6E6E73] dark:text-[#9CA3AF] mb-1.5">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />}
      <input
        {...props}
        className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 text-sm bg-[#F5F5F7] dark:bg-[#0B1120] border border-[#E5E5EA] dark:border-white/10 rounded-xl text-[#1C1C1E] dark:text-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#005DAB]/40 transition-all`}
      />
    </div>
  </div>
);

export default function TLAgents() {
  const { token } = useSelector((s) => s.auth);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAgents = useCallback(() => {
    setLoading(true);
    axios.get(`${API}/agents`, { headers })
      .then((r) => setAgents(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", password: "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (agent) => {
    setEditing(agent);
    setForm({ name: agent.name, email: agent.email, phone: agent.phone, password: "" });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setError("");
    if (!form.name || !form.email || !form.phone)
      return setError("Name, email and phone are required.");
    if (!editing && !form.password)
      return setError("Password is required for new agents.");
    setSaving(true);
    try {
      if (editing) {
        const payload = { name: form.name, email: form.email, phone: form.phone };
        if (form.password) payload.password = form.password;
        await axios.put(`${API}/agents/${editing._id}`, payload, { headers });
      } else {
        await axios.post(`${API}/agents`, form, { headers });
      }
      setShowModal(false);
      fetchAgents();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this agent from your team?")) return;
    try {
      await axios.delete(`${API}/agents/${id}`, { headers });
      setAgents((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete agent");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest flex items-center gap-2">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">My</span>
            <span className="text-[#FFD100]">Agents</span>
          </h1>
          <p className="text-xs text-[#6E6E73] dark:text-[#9CA3AF] mt-1 font-medium">
            {agents.length} agent{agents.length !== 1 ? "s" : ""} on your team
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#005DAB] to-[#007AFF] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-[#005DAB]/30 transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> Add Agent
        </button>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#005DAB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-16 border border-[#E5E5EA] dark:border-white/10 flex flex-col items-center">
          <Users className="w-12 h-12 text-[#E5E5EA] dark:text-white/10 mb-4" />
          <p className="text-sm font-bold text-[#6E6E73]">No agents yet</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Click "Add Agent" to onboard your first agent</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div
              key={agent._id}
              className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-[#E5E5EA] dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#005DAB] to-[#007AFF] flex items-center justify-center text-white font-black text-base shadow-sm">
                    {agent.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-sm text-[#1C1C1E] dark:text-white leading-tight">{agent.name}</p>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#005DAB]/10 text-[#005DAB] dark:bg-[#5AC8FA]/10 dark:text-[#5AC8FA]">
                      Agent
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(agent)}
                    className="p-1.5 rounded-lg hover:bg-[#F2F2F7] dark:hover:bg-[#0B1120] text-[#005DAB] dark:text-[#5AC8FA] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(agent._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#6E6E73] dark:text-[#9CA3AF]">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{agent.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6E6E73] dark:text-[#9CA3AF]">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{agent.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          title={editing ? "Edit Agent" : "Add New Agent"}
        >
          <div className="space-y-4">
            <InputField label="Full Name" icon={User} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rahul Sharma" />
            <InputField label="Email Address" icon={Mail} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="agent@email.com" />
            <InputField label="Phone Number" icon={Phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
            <InputField label={editing ? "New Password (leave blank to keep)" : "Password"} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E5EA] dark:border-white/10 text-xs font-black uppercase tracking-widest text-[#6E6E73] hover:bg-[#F5F5F7] dark:hover:bg-[#0B1120] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#005DAB] to-[#007AFF] text-white text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-[#005DAB]/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editing ? "Update" : "Create Agent"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
