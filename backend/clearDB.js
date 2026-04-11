const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const clearDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for cleanup...');

    // Load Models
    const User = require('./models/User');
    const Task = require('./models/Task');
    const Lead = require('./models/Lead');
    const Sale = require('./models/Sale');
    const Attendance = require('./models/Attendance');
    const Call = require('./models/Call');
    const CallQueue = require('./models/CallQueue');
    const Leave = require('./models/Leave');
    const LocationHistory = require('./models/LocationHistory');
    const WorkLog = require('./models/WorkLog');
    const WorkReport = require('./models/WorkReport');

    // Perform deletions
    const tasksDeleted = await Task.deleteMany({});
    const leadsDeleted = await Lead.deleteMany({});
    const salesDeleted = await Sale.deleteMany({});
    const attendanceDeleted = await Attendance.deleteMany({});
    const callsDeleted = await Call.deleteMany({});
    const callQueuesDeleted = await CallQueue.deleteMany({});
    const leavesDeleted = await Leave.deleteMany({});
    const locationsDeleted = await LocationHistory.deleteMany({});
    const workLogsDeleted = await WorkLog.deleteMany({});
    const workReportsDeleted = await WorkReport.deleteMany({});
    
    // Preserve Admin, delete all other users (sellers)
    const sellersDeleted = await User.deleteMany({ role: { $ne: 'admin' } });

    console.log('--- CLEANUP SUCCESSFUL ---');
    console.log(`- Tasks Removed: ${tasksDeleted.deletedCount}`);
    console.log(`- Leads Removed: ${leadsDeleted.deletedCount}`);
    console.log(`- Sales Removed: ${salesDeleted.deletedCount}`);
    console.log(`- Attendance Logs Removed: ${attendanceDeleted.deletedCount}`);
    console.log(`- Calls Removed: ${callsDeleted.deletedCount}`);
    console.log(`- Call Queues Removed: ${callQueuesDeleted.deletedCount}`);
    console.log(`- Leaves Removed: ${leavesDeleted.deletedCount}`);
    console.log(`- Location History Removed: ${locationsDeleted.deletedCount}`);
    console.log(`- Work Logs Removed: ${workLogsDeleted.deletedCount}`);
    console.log(`- Work Reports Removed: ${workReportsDeleted.deletedCount}`);
    console.log(`- Sellers Removed: ${sellersDeleted.deletedCount}`);
    console.log('---------------------------');
    console.log('Admin account preserved. System is now clean.');

    process.exit(0);
  } catch (err) {
    console.error('Cleanup Error:', err.message);
    process.exit(1);
  }
};

clearDatabase();
