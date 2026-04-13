const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Lead = require('./models/Lead');
const Sale = require('./models/Sale');
const Attendance = require('./models/Attendance');

dotenv.config();

const generateReport = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const today = new Date().toISOString().split('T')[0];
    
    const attendanceCount = await Attendance.countDocuments({ date: today });
    const newLeads = await Lead.countDocuments({ 
        createdAt: { $gte: new Date(today) } 
    });
    const approvedSales = await Sale.countDocuments({ 
        status: 'approved',
        updatedAt: { $gte: new Date(today) } 
    });
    const pendingSales = await Sale.countDocuments({ 
        status: 'pending' 
    });

    const activeSellers = await Attendance.find({ date: today }).populate('sellerId', 'name');

    console.log('--- TODAY REPORT (APRIL 11, 2026) ---');
    console.log(`Active Agents: ${attendanceCount}`);
    console.log(`New Leads Logged: ${newLeads}`);
    console.log(`Verified Sales (Approved): ${approvedSales}`);
    console.log(`Total Pending Audit: ${pendingSales}`);
    console.log('\n--- AGENT STATUS ---');
    activeSellers.forEach(a => {
      console.log(`- ${a.sellerId?.name || 'Unknown'}: Checked in at ${new Date(a.checkIn).toLocaleTimeString()} (${a.mode})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

generateReport();
