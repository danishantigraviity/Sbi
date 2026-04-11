const User = require('../models/User');
const Task = require('../models/Task');
const Lead = require('../models/Lead');
const Sale = require('../models/Sale');
const Call = require('../models/Call');
const Attendance = require('../models/Attendance');
const LocationHistory = require('../models/LocationHistory');
const { getEncodingFromImage } = require('../utils/faceHandler');

// Get all sellers
exports.getAllSellers = async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sellers = await User.find(query).select('-password');
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a task
exports.createTask = async (req, res) => {
  try {
    const { assignedTo, title, description } = req.body;
    const task = new Task({ assignedTo, title, description, createdBy: req.user.id });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const { status, sellerId } = req.query;
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (sellerId && sellerId !== 'all') query.assignedTo = sellerId;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update task (General purpose)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('assignedTo', 'name email');
    
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task successfully purged from the queue' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Dashboard Stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalLeads = await Lead.countDocuments();
    const totalSales = await Sale.countDocuments({ status: 'approved' });
    const pendingSales = await Sale.countDocuments({ status: 'pending' });
    const totalConversions = await Lead.countDocuments({ status: 'converted' });

    // ... (group logic)
    const topPerformersData = await Sale.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$sellerId', sales: { $sum: 1 } } },
      { $sort: { sales: -1 } },
      { $limit: 3 }
    ]);

    const topPerformers = await Promise.all(topPerformersData.map(async (p) => {
      const user = await User.findById(p._id).select('name');
      return {
        name: user ? user.name : 'Unknown',
        sales: p.sales
      };
    }));

    res.json({ totalSellers, totalLeads, totalSales, pendingSales, totalConversions, topPerformers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Calls
exports.getAllCalls = async (req, res) => {
  try {
    const calls = await Call.find()
      .populate('sellerId', 'name email')
      .populate('leadId', 'name phone')
      .sort({ createdAt: -1 });
    res.json(calls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Sales
exports.getAllSales = async (req, res) => {
  try {
    const { date, sellerId, status } = req.query;
    let query = {};

    if (sellerId && sellerId !== 'all') {
      query.sellerId = sellerId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const sales = await Sale.find(query)
      .populate('sellerId', 'name email')
      .populate('leadId', 'name phone')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Attendance for all sellers
exports.getAttendance = async (req, res) => {
  try {
    const { sellerId } = req.query;

    // Default to today's date in YYYY-MM-DD format if not provided
    const today = new Date().toISOString().split('T')[0];
    const date = req.query.date || today;

    let query = { date };
    if (sellerId) query.sellerId = sellerId;

    const attendance = await Attendance.find(query)
      .populate('sellerId', 'name email')
      .sort({ checkIn: -1 });
    
    const formattedAttendance = attendance.map(rec => {
      // Safely handle cases where seller data might be missing or deleted
      if (!rec.sellerId) {
        return {
          ...rec._doc,
          sellerId: { name: 'Deactivated User', email: 'N/A' },
          isLate: false
        };
      }

      const checkInTime = rec.checkIn ? new Date(rec.checkIn) : null;
      let isLate = false;
      
      if (checkInTime && !isNaN(checkInTime.getTime())) {
        const minutesSinceMidnight = checkInTime.getHours() * 60 + checkInTime.getMinutes();
        isLate = minutesSinceMidnight > 570; // Late after 9:30 AM
      }

      return { ...rec._doc, isLate };
    });

    res.json(formattedAttendance);
  } catch (err) {
    console.error('Attendance Fetch Error:', err);
    res.status(500).json({ message: 'Internal Server Error while retrieving registry' });
  }
};

// Update Seller
exports.updateSeller = async (req, res) => {
  try {
    const { name, email, phone, role, faceSamples } = req.body;
    const seller = await User.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    seller.name = name || seller.name;
    seller.email = email || seller.email;
    seller.phone = phone || seller.phone;
    seller.role = role || seller.role;

    // Process new biometric face scans if updated
    if (faceSamples && Array.isArray(faceSamples) && faceSamples.length > 0) {
      const encodings = [];
      for (const imgB64 of faceSamples) {
        const encoding = await getEncodingFromImage(imgB64);
        if (encoding) encodings.push(encoding);
      }
      if (encodings.length > 0) {
        seller.faceEncodings = encodings;
      }
    }

    await seller.save();
    res.json(seller);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Seller
exports.deleteSeller = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    await User.findByIdAndDelete(req.params.id);
    // Deep cleanup to prevent orphan records
    await Promise.all([
      Attendance.deleteMany({ sellerId: req.params.id }),
      Lead.deleteMany({ sellerId: req.params.id }),
      Sale.deleteMany({ sellerId: req.params.id }),
      Call.deleteMany({ sellerId: req.params.id }),
      Task.deleteMany({ assignedTo: req.params.id })
    ]);
    
    res.json({ message: 'Seller and all associated records deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Sale Status (Verify/Reject)
exports.updateSaleStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get All Leads
exports.getAllLeads = async (req, res) => {
  try {
    const { sellerId, status, search } = req.query;
    let query = {};

    if (sellerId && sellerId !== 'all') {
      query.sellerId = sellerId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const leads = await Lead.find(query)
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new lead (Admin manual entry)
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, address, sellerId, status } = req.body;
    const lead = new Lead({ 
      name, 
      email, 
      phone, 
      address, 
      sellerId, 
      status: status || 'new' 
    });
    await lead.save();
    
    // Auto-populate for consistent UI response
    const populatedLead = await lead.populate('sellerId', 'name email');
    res.status(201).json(populatedLead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a lead
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('sellerId', 'name email');
    
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a lead
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    // Deep cleanup for associated data
    await Promise.all([
      Sale.deleteMany({ leadId: req.params.id }),
      Call.deleteMany({ leadId: req.params.id })
    ]);

    res.json({ message: 'Lead and associated records purged successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a sale
exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale record not found' });
    res.json({ message: 'Sale record eliminated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Location History for Agent
exports.getLocationHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await LocationHistory.find({ userId: id })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get Attendance History for Individual Agent (Admin View)
exports.getAgentAttendanceHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await Attendance.find({ sellerId: id })
      .sort({ date: -1, createdAt: -1 })
      .limit(60); // Fetch last 60 days
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Current Active Tracking Sessions (For Live Map Hydration)
exports.getActiveTrackingSessions = async (req, res) => {
  try {
    const activeAttendance = await Attendance.find({ checkOut: { $exists: false } })
      .populate('sellerId', 'name email status');
      
    const agents = {};
    activeAttendance.forEach(att => {
      if (att.sellerId) {
        agents[att.sellerId._id] = {
          userId: att.sellerId._id,
          name: att.sellerId.name,
          email: att.sellerId.email,
          status: 'online', // They are checked in, so we assume online for the hydrator
          lat: att.checkInLocation?.lat,
          lng: att.checkInLocation?.lng,
          lastSeen: att.updatedAt
        };
      }
    });

    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
