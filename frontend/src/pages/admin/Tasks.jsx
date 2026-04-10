import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClipboardList, 
  Plus, 
  Calendar, 
  User, 
  CheckCircle2, 
  Filter, 
  Trash2, 
  Edit2, 
  X, 
  ShieldAlert 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import CustomSelect from '../../components/CustomSelect';

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [newTask, setNewTask] = useState({ assignedTo: '', title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
    fetchSellers();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get('/api/admin/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTasks(data || []);
    } catch (err) {
      toast.error('Failed to load tasks. Please refresh.');
    }
  };

  const fetchSellers = async () => {
    try {
      const { data } = await axios.get('/api/admin/sellers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSellers(data || []);
    } catch (err) {
      console.error('Fetch sellers error');
    }
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!newTask.assignedTo) return toast.error('Please assign an agent');
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`/api/admin/task/${editingId}`, newTask, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Task updated');
      } else {
        await axios.post('/api/admin/tasks', newTask, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Task assigned');
      }
      setShowModal(false);
      setEditingId(null);
      setNewTask({ assignedTo: '', title: '', description: '' });
      fetchTasks();
    } catch (err) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'pending' ? 'completed' : 'pending';
    try {
      await axios.put(`/api/admin/task/${task._id}`, { status: nextStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success(`Task ${nextStatus}`);
      fetchTasks();
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/admin/task/${deletingTask}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Task eliminated');
      setShowDeleteConfirm(false);
      setDeletingTask(null);
      fetchTasks();
    } catch (err) {
      toast.error('Purge failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => statusFilter === 'all' || t.status === statusFilter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight ">
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Task</span> <span className="text-[#FFD100]">Engagement</span>
          </h2>
          <p className="text-sub dark:text-[#E5E7EB]/60 font-medium text-xs uppercase tracking-widest mt-1">
            Create and monitor tasks for your sales team
          </p>
        </div>
        <button onClick={() => { setEditingId(null); setNewTask({ assignedTo: '', title: '', description: '' }); setShowModal(true); }} className="px-6 py-3 rounded-2xl bg-[#005DAB] text-white font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-[#005DAB]/20 flex items-center hover:scale-105 transition-all">
          <Plus className="w-4 h-4 mr-3" /> Assign New Task
        </button>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-[#E5E5EA] dark:border-white/10 shadow-2xl">
        <div className="p-6 border-b border-[#E5E5EA] dark:border-white/5 flex items-center justify-between bg-[#F9F9FB] dark:bg-[#0B1120]">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-[#005DAB]" />
            <div className="w-48">
              <CustomSelect 
                options={[
                  { label: "All Tasks", value: "all" },
                  { label: "Pending", value: "pending" },
                  { label: "Completed", value: "completed" },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                icon={Filter}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <motion.div key={task._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#F9F9FB] dark:bg-[#0B1120] p-6 rounded-[2.5rem] border border-[#E5E5EA] dark:border-white/5 relative group">
                <div className="flex justify-between items-start mb-4">
                  <button onClick={() => handleToggleStatus(task)} className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${task.status === 'completed' ? 'bg-green-50 text-green-500 border-green-100' : 'bg-amber-50 text-amber-500 border-amber-100'}`}>
                    {task.status}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(task._id); setNewTask({ assignedTo: task.assignedTo?._id, title: task.title, description: task.description }); setShowModal(true); }} className="p-2 bg-white rounded-xl text-blue-500 shadow-sm"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { setDeletingTask(task._id); setShowDeleteConfirm(true); }} className="p-2 bg-white rounded-xl text-red-500 shadow-sm"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-lead uppercase tracking-tight">{task.title}</h3>
                <p className="text-sm font-bold text-sub mt-2 leading-relaxed">"{task.description}"</p>
                <div className="mt-6 pt-4 border-t border-[#E5E5EA] flex items-center justify-between">
                  <div className="flex items-center text-[10px] font-bold text-sub uppercase">
                    <User className="w-3.5 h-3.5 mr-2" /> {task.assignedTo?.name || 'Unassigned'}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-white dark:bg-[#111827] rounded-[3rem] shadow-2xl p-8 border border-[#E5E5EA]">
              <h3 className="text-2xl font-bold mb-6 uppercase tracking-tight">
                <span className="text-[#005DAB] dark:text-[#5AC8FA]">
                  {editingId ? "Edit" : "New"}
                </span>{" "}
                <span className="text-[#FFD100]">Task</span>
              </h3>
              <form onSubmit={handleSubmitTask} className="space-y-4">
                <CustomSelect label="Assign to Agent" options={sellers.map(s => ({ label: s.name, value: s._id }))} value={newTask.assignedTo} onChange={(val) => setNewTask({...newTask, assignedTo: val})} />
                <input required placeholder="Task Title" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-none font-bold text-sm" />
                <textarea required placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} rows="4" className="w-full px-6 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-none font-bold text-sm resize-none" />
                <button type="submit" disabled={loading} className="w-full py-5 rounded-2xl bg-[#005DAB] text-white font-bold uppercase text-[10px] tracking-widest shadow-xl">{editingId ? 'Update Task' : 'Assign Task'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-[#111827] border border-[#E5E5EA] dark:border-white/10 rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl">
              <div className="w-20 h-20 bg-red-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">
                <span className="text-[#005DAB]">Purge</span>{" "}
                <span className="text-red-500">Task?</span>
              </h3>
              <p className="text-sub dark:text-[#E5E7EB]/60 text-sm font-bold uppercase tracking-widest leading-relaxed mb-10">Executing this action will permanently clear the task and all associated history. This operation is absolute.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-4 bg-[#F2F2F7] dark:bg-white/5 text-sub dark:text-[#E5E7EB]/60 rounded-2xl font-bold uppercase text-[10px] tracking-widest">Abort</button>
                <button onClick={handleDeleteTask} disabled={deleteLoading} className="flex-1 py-4 bg-[#FF3B30] text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-[#FF3B30]/30">{deleteLoading ? '...' : 'Execute'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTasks;
