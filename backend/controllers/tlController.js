const User = require('../models/User');
const Task = require('../models/Task');
const Lead = require('../models/Lead');
const bcrypt = require('bcryptjs');

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
exports.getTLStats = async (req, res) => {
  try {
    const tlId = req.user._id;
    const agents = await User.find({ managedBy: tlId, role: 'seller' });
    const agentIds = agents.map(a => a._id);

    const [totalAgents, totalTasks, completedTasks, totalLeads, openLeads, convertedLeads] = await Promise.all([
      User.countDocuments({ managedBy: tlId, role: 'seller' }),
      Task.countDocuments({ createdBy: tlId }),
      Task.countDocuments({ createdBy: tlId, status: 'completed' }),
      Lead.countDocuments({ assignedBy: tlId }),
      Lead.countDocuments({ assignedBy: tlId, status: { $in: ['new', 'called', 'follow-up'] } }),
      Lead.countDocuments({ assignedBy: tlId, status: 'converted' }),
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Task breakdown by status
    const taskStatusBreakdown = await Task.aggregate([
      { $match: { createdBy: tlId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Task breakdown by priority
    const taskPriorityBreakdown = await Task.aggregate([
      { $match: { createdBy: tlId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Agent performance (tasks completed per agent)
    const agentPerformance = await Promise.all(agents.map(async (agent) => {
      const assigned = await Task.countDocuments({ assignedTo: agent._id, createdBy: tlId });
      const completed = await Task.countDocuments({ assignedTo: agent._id, createdBy: tlId, status: 'completed' });
      const leads = await Lead.countDocuments({ sellerId: agent._id, assignedBy: tlId });
      return {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        assigned,
        completed,
        leads,
        rate: assigned > 0 ? Math.round((completed / assigned) * 100) : 0
      };
    }));

    // Recent activity (last 5 tasks updated)
    const recentTasks = await Task.find({ createdBy: tlId })
      .populate('assignedTo', 'name')
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    res.json({
      totalAgents,
      totalTasks,
      completedTasks,
      totalLeads,
      openLeads,
      convertedLeads,
      completionRate,
      taskStatusBreakdown,
      taskPriorityBreakdown,
      agentPerformance,
      recentTasks
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Agent Management ─────────────────────────────────────────────────────────
exports.getMyAgents = async (req, res) => {
  try {
    const agents = await User.find({ managedBy: req.user._id, role: 'seller' })
      .select('-password -faceEncodings')
      .sort({ createdAt: -1 });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAgent = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const agent = new User({
      name,
      email,
      phone,
      password, // auto-hashed by pre-save hook
      role: 'seller',
      managedBy: req.user._id
    });
    await agent.save();
    
    const safe = agent.toObject();
    delete safe.password;
    delete safe.faceEncodings;
    res.status(201).json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAgent = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const agent = await User.findOne({ _id: req.params.id, managedBy: req.user._id, role: 'seller' });
    if (!agent) return res.status(404).json({ message: 'Agent not found or not in your team' });

    if (name) agent.name = name;
    if (email) agent.email = email;
    if (phone) agent.phone = phone;
    if (password) agent.password = password; // triggers pre-save hash

    await agent.save();
    const safe = agent.toObject();
    delete safe.password;
    delete safe.faceEncodings;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAgent = async (req, res) => {
  try {
    const agent = await User.findOne({ _id: req.params.id, managedBy: req.user._id, role: 'seller' });
    if (!agent) return res.status(404).json({ message: 'Agent not found or not in your team' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Agent removed from your team' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Task Management ──────────────────────────────────────────────────────────
exports.getTLTasks = async (req, res) => {
  try {
    const { status, priority, agentId } = req.query;
    let query = { createdBy: req.user._id };
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (agentId && agentId !== 'all') query.assignedTo = agentId;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTLTask = async (req, res) => {
  try {
    const { assignedTo, title, description, priority, deadline } = req.body;
    if (!assignedTo || !title || !description)
      return res.status(400).json({ message: 'assignedTo, title, and description are required' });

    // Verify agent belongs to this TL
    const agent = await User.findOne({ _id: assignedTo, managedBy: req.user._id });
    if (!agent) return res.status(403).json({ message: 'Agent is not in your team' });

    const task = new Task({
      assignedTo,
      title,
      description,
      priority: priority || 'medium',
      deadline: deadline || null,
      createdBy: req.user._id,
      status: 'pending'
    });
    await task.save();
    const populated = await task.populate('assignedTo', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTLTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('assignedTo', 'name email');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTLTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Lead Management ──────────────────────────────────────────────────────────
exports.getTLLeads = async (req, res) => {
  try {
    const { status, agentId, search } = req.query;
    let query = { assignedBy: req.user._id };
    if (status && status !== 'all') query.status = status;
    if (agentId && agentId !== 'all') query.sellerId = agentId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const leads = await Lead.find(query)
      .populate('sellerId', 'name email')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTLLead = async (req, res) => {
  try {
    const { name, email, phone, address, sellerId, notes, status } = req.body;
    if (!name || !email || !phone || !address || !sellerId)
      return res.status(400).json({ message: 'name, email, phone, address, and sellerId are required' });

    // Verify agent belongs to this TL
    const agent = await User.findOne({ _id: sellerId, managedBy: req.user._id });
    if (!agent) return res.status(403).json({ message: 'Agent is not in your team' });

    const lead = new Lead({
      name, email, phone, address,
      sellerId,
      assignedBy: req.user._id,
      notes: notes || '',
      status: status || 'new'
    });
    await lead.save();
    const populated = await lead.populate([
      { path: 'sellerId', select: 'name email' },
      { path: 'assignedBy', select: 'name' }
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTLLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, assignedBy: req.user._id });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate([
      { path: 'sellerId', select: 'name email' },
      { path: 'assignedBy', select: 'name' }
    ]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTLLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, assignedBy: req.user._id });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
