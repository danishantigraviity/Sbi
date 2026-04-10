const Leave = require('../models/Leave');

exports.requestLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;

    // Validation
    if (!type) return res.status(400).json({ message: 'Absence type is required' });
    if (!startDate) return res.status(400).json({ message: 'Start date is required' });
    if (!endDate) return res.status(400).json({ message: 'End date is required' });
    if (!reason) return res.status(400).json({ message: 'Reason is required' });

    // Check if end date is before start date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (new Date(endDate) < start) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }

    console.log('Incoming leave request:', {
      body: req.body,
      user: req.user ? { id: req.user.id, role: req.user.role } : 'null'
    });

    const leave = new Leave({
      sellerId: req.user._id,
      type,
      startDate,
      endDate,
      reason
    });
    await leave.save();
    console.log('Leave saved successfully:', leave._id);
    res.status(201).json({ message: 'Leave request submitted successfully', leave });
  } catch (err) {
    console.error('Leave submission error:', err);
    res.status(500).json({ message: 'Failed to submit leave request', error: err.message });
  }
};

exports.getSellerLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leaves', error: err.message });
  }
};

exports.getAllLeavesAdmin = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('sellerId', 'name email phone')
      .populate('logs.adminId', 'name')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch all leaves', error: err.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = status;
    leave.adminNotes = adminNotes || leave.adminNotes;
    leave.logs.push({
      action: `Status updated to ${status}`,
      adminId: req.user.id
    });

    await leave.save();
    res.json({ message: `Leave ${status} successfully`, leave });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update leave status', error: err.message });
  }
};
