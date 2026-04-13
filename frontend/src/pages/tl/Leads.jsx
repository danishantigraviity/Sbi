import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Target, Plus, Pencil, Trash2, X, Loader2, Search, Filter,
  Mail, Phone, MapPin, StickyNote, ChevronDown, User
} from "lucide-react";

const API = "/api/tl";

const STATUS_META = {
  new:       { label: "New",       cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  called:    { label: "Called",    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  "follow-up": { label: "Follow-Up", cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  converted: { label: "Converted", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  lost:      { label: "Lost",      cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
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

export default function TLLeads() {
  const { token } = useSelector((s) => s.auth);
  const headers = { Authorization: `Bearer ${token}` };

  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "all", agentId: "all" });
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", sellerId: "", notes: "", status: "new"
  });

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.agentId !== "all") params.set("agentId", filters.agentId);
    if (search) params.set("search", search);

    Promise.all([
      axios.get(`${API}/leads?${params}`, { headers }),
      axios.get(`${API}/agents`, { headers }),
    ])
      .then(([l, a]) => { setLeads(l.data); setAgents(a.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, filters, search]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", address: "", sellerId: "", notes: "", status: "new" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (lead) => {
    setEditing(lead);
    setForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      address: lead.address,
      sellerId: lead.sellerId?._id || "",
      notes: lead.notes || "",
      status: lead.status,
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setError("");
    if (!form.name || !form.email || !form.phone || !form.address || !form.sellerId)
      return setError("All fields except notes are required.");
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${API}/lead/${editing._id}`, form, { headers });
      } else {
        await axios.post(`${API}/lead`, form, { headers });
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
    if (!window.confirm("Delete this lead?")) return;
    try {
      await axios.delete(`${API}/lead/${id}`, { headers });
      setLeads((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleStatusChange = async (lead, newStatus) => {
    try {
      const updated = await axios.put(`${API}/lead/${lead._id}`, { status: newStatus }, { headers });
      setLeads((prev) => prev.map((l) => (l._id === lead._id ? updated.data : l)));
    } catch (err) {
      console.error(err);
    }
  };

  // Stat counts
  const counts = Object.keys(STATUS_META).reduce((acc, k) => {
    acc[k] = leads.filter((l) => l.status === k).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest flex items-center gap-2">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Lead</span>
            <span className="text-[#FFD100]">Management</span>
          </h1>
          <p className="text-xs text-[#6E6E73] dark:text-[#9CA3AF] mt-1 font-medium">
            {leads.length} lead{leads.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#005DAB] to-[#007AFF] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-[#005DAB]/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Assign Lead
        </button>
      </div>

      {/* Status pills summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(STATUS_META).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setFilters({ ...filters, status: filters.status === k ? "all" : k })}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              filters.status === k
                ? v.cls + " ring-2 ring-offset-1 ring-[#005DAB]/30"
                : "bg-[#F5F5F7] dark:bg-[#0B1120] text-[#6E6E73] dark:text-[#9CA3AF] border-[#E5E5EA] dark:border-white/10 hover:border-[#005DAB]/30"
            }`}
          >
            {v.label} · {counts[k] || 0}
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-[#E5E5EA] dark:border-white/10 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F5F5F7] dark:bg-[#0B1120] border border-[#E5E5EA] dark:border-white/10 rounded-xl text-[#1C1C1E] dark:text-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#005DAB]/40 transition-all"
          />
        </div>
        <select value={filters.agentId} onChange={(e) => setFilters({ ...filters, agentId: e.target.value })}
          className="px-3 py-2 text-sm bg-[#F5F5F7] dark:bg-[#0B1120] border border-[#E5E5EA] dark:border-white/10 rounded-xl text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005DAB]/40 cursor-pointer">
          <option value="all">All Agents</option>
          {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#005DAB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-16 border border-[#E5E5EA] dark:border-white/10 flex flex-col items-center">
          <Target className="w-12 h-12 text-[#E5E5EA] dark:text-white/10 mb-4" />
          <p className="text-sm font-bold text-[#6E6E73]">No leads found</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Assign a lead to one of your agents</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E5EA] dark:border-white/10 shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F2F2F7] dark:border-white/5">
                  {["Lead", "Contact", "Assigned To", "Notes", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F2F7] dark:divide-white/5">
                {leads.map((lead) => {
                  const sm = STATUS_META[lead.status] || STATUS_META.new;
                  return (
                    <tr key={lead._id} className="hover:bg-[#F9F9FB] dark:hover:bg-[#0B1120]/50 transition-colors group">
                      <td className="px-4 py-3">
                        <p className="text-xs font-black text-[#1C1C1E] dark:text-white">{lead.name}</p>
                        <p className="text-[10px] text-[#9CA3AF] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" /> {lead.address}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-[#6E6E73] dark:text-[#9CA3AF] flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {lead.phone}
                        </p>
                        <p className="text-xs text-[#6E6E73] dark:text-[#9CA3AF] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {lead.email}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#005DAB] to-[#007AFF] flex items-center justify-center text-white text-[9px] font-black">
                            {lead.sellerId?.name?.[0] || "?"}
                          </div>
                          <span className="text-xs font-bold text-[#1C1C1E] dark:text-white">{lead.sellerId?.name || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="text-xs text-[#6E6E73] dark:text-[#9CA3AF] truncate">{lead.notes || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead, e.target.value)}
                            className={`text-[9px] font-black uppercase pl-2 pr-6 py-1.5 rounded-lg border-0 cursor-pointer appearance-none ${sm.cls}`}
                          >
                            {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(lead)} className="p-1.5 rounded-lg hover:bg-[#F2F2F7] dark:hover:bg-white/5 text-[#005DAB] dark:text-[#5AC8FA] transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(lead._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-[#F2F2F7] dark:divide-white/5">
            {leads.map((lead) => {
              const sm = STATUS_META[lead.status] || STATUS_META.new;
              return (
                <div key={lead._id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-sm text-[#1C1C1E] dark:text-white">{lead.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${sm.cls}`}>{sm.label}</span>
                  </div>
                  <p className="text-xs text-[#6E6E73]">{lead.phone} · {lead.email}</p>
                  <p className="text-xs text-[#9CA3AF]">→ {lead.sellerId?.name || "Unassigned"}</p>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => openEdit(lead)} className="flex-1 py-1.5 rounded-xl border border-[#005DAB]/30 text-[#005DAB] text-[10px] font-black uppercase tracking-widest">Edit</button>
                    <button onClick={() => handleDelete(lead._id)} className="flex-1 py-1.5 rounded-xl border border-red-200 text-red-500 text-[10px] font-black uppercase tracking-widest">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editing ? "Edit Lead" : "Assign Lead"}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Customer name" className={inputCls} />
              </Field>
              <Field label="Phone">
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210" className={inputCls} />
              </Field>
            </div>
            <Field label="Email">
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="customer@email.com" className={inputCls} />
            </Field>
            <Field label="Address">
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="City, State" className={inputCls} />
            </Field>
            <Field label="Assign To Agent">
              <select value={form.sellerId} onChange={(e) => setForm({ ...form, sellerId: e.target.value })} className={inputCls}>
                <option value="">Select agent…</option>
                {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                  {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </Field>
              <Field label="Notes (optional)">
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any remarks…" className={inputCls} />
              </Field>
            </div>
            {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-[#E5E5EA] dark:border-white/10 text-xs font-black uppercase tracking-widest text-[#6E6E73] hover:bg-[#F5F5F7] dark:hover:bg-[#0B1120] transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#005DAB] to-[#007AFF] text-white text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-[#005DAB]/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editing ? "Update Lead" : "Assign Lead"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
