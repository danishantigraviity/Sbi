const Lead = require('../models/Lead');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const Call = require('../models/Call');
const Sale = require('../models/Sale');
const CallQueue = require('../models/CallQueue');
const { calculateDistance, OFFICE_COORDS } = require('../utils/geo');

// Get Seller's Leads
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a Lead
exports.createLead = async (req, res) => {
  try {
    const { name, address, email, phone } = req.body;
    const lead = new Lead({ name, address, email, phone, sellerId: req.user.id });
    await lead.save();
    
    // Automatically add to autocall queue
    const queueItem = new CallQueue({
      leadId: lead._id,
      sellerId: req.user.id,
      phoneNumber: phone,
      status: 'pending'
    });
    await queueItem.save();

    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Assigned Tasks
exports.getSellerTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Task Status (Complete)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, assignedTo: req.user.id },
      { status },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Log Call and Update Lead
exports.logCall = async (req, res) => {
  try {
    const { leadId, callStatus, notes } = req.body;
    const call = new Call({ sellerId: req.user.id, leadId, callStatus, notes });
    await call.save();

    await Lead.findByIdAndUpdate(leadId, { status: 'called' });
    res.status(201).json(call);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check-In with GPS Validation
exports.checkIn = async (req, res) => {
  try {
    const { mode, lat, lng, shift } = req.body;
    const date = new Date().toISOString().split('T')[0];
    
    // Prevent Duplicate Marking for Today
    const existingAttendance = await Attendance.findOne({ sellerId: req.user.id, date });
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already synchronized for today\'s date' });
    }

    // Geo-fencing Audit (Logs location but no longer blocks)
    if (mode === 'office' && lat && lng) {
      const distance = calculateDistance(lat, lng, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
      console.log(`[ATTENDANCE] Check-in from ${Math.round(distance)}m away.`);
    }

    const attendance = new Attendance({
      sellerId: req.user.id,
      checkIn: new Date(),
      date,
      mode: mode || 'office',
      shift: shift || 'day',
      checkInLocation: { lat, lng }
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Break Management
exports.startBreak = async (req, res) => {
  try {
    const { breakType } = req.body; // '15m', '30m'
    const attendance = await Attendance.findOne({ 
      sellerId: req.user.id, 
      checkOut: { $exists: false } 
    }).sort({ createdAt: -1 });

    if (!attendance) return res.status(404).json({ message: 'No active attendance session' });
    
    attendance.breaks.push({
      type: breakType,
      start: new Date()
    });

    await attendance.save();
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.endBreak = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({ 
      sellerId: req.user.id, 
      checkOut: { $exists: false } 
    }).sort({ createdAt: -1 });

    if (!attendance) return res.status(404).json({ message: 'No active attendance session' });

    const latestBreak = attendance.breaks[attendance.breaks.length - 1];
    if (!latestBreak || latestBreak.end) {
      return res.status(400).json({ message: 'No active break to end' });
    }

    latestBreak.end = new Date();
    
    // Calculate total break time
    const durationMs = latestBreak.end - latestBreak.start;
    const durationMin = Math.round(durationMs / 60000);
    attendance.totalBreakTime += durationMin;

    await attendance.save();
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check-Out
exports.checkOut = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    // Geo-fencing Audit (Logs location but no longer blocks)
    if (lat && lng) {
      const distance = calculateDistance(lat, lng, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
      console.log(`[ATTENDANCE] Check-out from ${Math.round(distance)}m away.`);
    }

    const attendance = await Attendance.findOneAndUpdate(
      { sellerId: req.user.id, checkOut: { $exists: false } },
      { checkOut: new Date(), checkOutLocation: { lat, lng } },
      { new: true }
    );
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Convert Lead to Sale
exports.createSale = async (req, res) => {
    try {
      const { leadId, cardType } = req.body;
      const sale = new Sale({ sellerId: req.user.id, leadId, cardType });
      await sale.save();
      await Lead.findByIdAndUpdate(leadId, { status: 'converted' });
      res.status(201).json(sale);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

// Get Personal Attendance History
exports.getMyAttendance = async (req, res) => {
  try {
    const history = await Attendance.find({ sellerId: req.user.id })
      .sort({ date: -1, createdAt: -1 })
      .limit(10);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Dashboard Stats for Seller
exports.getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [totalCalls, convertedLeads, cardSales, attendanceRecord] = await Promise.all([
      Call.countDocuments({ sellerId }),
      Lead.countDocuments({ sellerId, status: 'converted' }),
      Sale.countDocuments({ sellerId }),
      Attendance.findOne({ sellerId, date: today }).sort({ createdAt: -1 })
    ]);

    res.json({
      totalCalls,
      convertedLeads,
      cardSales,
      attendance: attendanceRecord
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
