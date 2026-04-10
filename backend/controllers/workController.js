const WorkLog = require('../models/WorkLog');
const User = require('../models/User');
const WorkReport = require('../models/WorkReport');

// Seller: Start Work Session / Request Permission
// ... existing startSession and other functions ...
exports.startSession = async (req, res) => {
  try {
    const { mode, reason, lat, lng, duration: requestedDuration } = req.body;
    const sellerId = req.user.id;

    const user = await User.findById(sellerId);

    // Only block duplicate active sessions for company mode
    // Personal requests are just requests to admin and should always be allowed
    if (mode === 'company' && user.activeLogId) {
      return res.status(400).json({ message: 'An active company session is already running. Stop it before starting a new one.' });
    }

    // Also block if there's already a pending personal request
    if (mode === 'personal') {
      const existingPending = await WorkLog.findOne({ sellerId, status: 'pending' });
      if (existingPending) {
        return res.status(400).json({ message: 'You already have a pending permission request awaiting admin approval.' });
      }
    }

    const workLog = new WorkLog({
      sellerId,
      mode,
      reason,
      startTime: new Date(),
      location: { lat, lng },
      requestedDuration
    });

    await workLog.save();

    // If company mode, update user status immediately
    if (mode === 'company') {
      user.workMode = 'company';
      user.activeLogId = workLog._id;
      await user.save();
    }
    // Note: for 'personal', user.workMode remains 'idle' until admin approves

    res.status(201).json({
      message: mode === 'company' ? 'Work session started' : 'Personal work request submitted to Admin',
      workLog
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Seller: End Active Work Session
exports.stopSession = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const user = await User.findById(sellerId);

    if (!user.activeLogId) {
       // Also check if there's a pending personal request to cancel
       const pendingLog = await WorkLog.findOne({ sellerId, status: 'pending' }).sort({ createdAt: -1 });
       if (pendingLog) {
         await WorkLog.findByIdAndDelete(pendingLog._id);
         return res.json({ message: 'Pending request cancelled' });
       }
       return res.status(400).json({ message: 'No active session found' });
    }

    const workLog = await WorkLog.findById(user.activeLogId);
    if (workLog) {
      workLog.endTime = new Date();
      workLog.duration = Math.round((workLog.endTime - workLog.startTime) / 60000); // minutes
      await workLog.save();
    }

    user.workMode = 'idle';
    user.activeLogId = null;
    await user.save();

    res.json({ message: 'Session ended successfully', workLog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get All Pending Permission Requests
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await WorkLog.find({ status: 'pending' })
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Handle Request (Approve/Reject)
exports.handleRequest = async (req, res) => {
  try {
    const { requestId, status } = req.body; // 'approved' or 'rejected'
    const workLog = await WorkLog.findById(requestId);

    if (!workLog) return res.status(404).json({ message: 'Request not found' });
    if (workLog.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    workLog.status = status;
    workLog.approvedBy = req.user.id;
    
    if (status === 'approved') {
        workLog.startTime = new Date(); // Reset start time to approval time
        await workLog.save();

        // Update seller status dynamically based on request mode
        await User.findByIdAndUpdate(workLog.sellerId, {
            workMode: workLog.mode,
            activeLogId: workLog._id
        });
    } else {
        await workLog.save();
    }

    res.json({ message: `Request ${status} successfully`, workLog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Shared: Get Current Mode Status
exports.getCurrentStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('activeLogId');
        // Also check if there's a pending request
        const pending = await WorkLog.findOne({ sellerId: req.user.id, status: 'pending' });
        
        res.json({
            workMode: user.workMode,
            activeSession: user.activeLogId,
            pendingRequest: pending
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Seller: Get All Personal Mode Requests (History for Duty Permissions tab)
exports.getSellerRequests = async (req, res) => {
    try {
        const requests = await WorkLog.find({ 
            sellerId: req.user.id,
            mode: { $in: ['personal', 'office'] }
        }).sort({ createdAt: -1 });
        
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Seller: Get Work Usage Report
exports.getWorkReport = async (req, res) => {
    try {
        const logs = await WorkLog.find({ 
            sellerId: req.user.id,
            status: 'approved'
        }).sort({ createdAt: -1 });

        const summary = {
            totalCompanyMinutes: 0,
            totalPersonalMinutes: 0,
            logCount: logs.length
        };

        logs.forEach(log => {
            if (log.duration) {
                if (log.mode === 'company') summary.totalCompanyMinutes += log.duration;
                else summary.totalPersonalMinutes += log.duration;
            }
        });

        res.json({ summary, logs });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Get All Staff Work Usage Report
exports.getAdminWorkReport = async (req, res) => {
    try {
        const logs = await WorkLog.find({ status: 'approved' })
            .populate('sellerId', 'name email')
            .sort({ createdAt: -1 });

        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Manual Reports Handling
exports.submitManualReport = async (req, res) => {
    try {
        const { text } = req.body;
        const sellerId = req.user.id;
        
        const reportData = {
            sellerId,
            text,
            createdAt: new Date()
        };

        if (req.file) {
            reportData.fileUrl = `/uploads/reports/${req.file.filename}`;
            reportData.fileName = req.file.originalname;
        }

        const report = new WorkReport(reportData);
        await report.save();

        res.status(201).json({ message: 'Manual report submitted successfully', report });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getManualReports = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'seller') {
            query.sellerId = req.user.id;
        }

        const reports = await WorkReport.find(query)
            .populate('sellerId', 'name email')
            .sort({ createdAt: -1 });

        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
