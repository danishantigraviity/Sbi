const mongoose = require('mongoose');
const User = require('./models/User');
const Lead = require('./models/Lead');
const Sale = require('./models/Sale');
const Attendance = require('./models/Attendance');
const Task = require('./models/Task');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('[SEED] Starting Full Data Seed...');
    
    // 1. Ensure Demo Seller Exists
    const sellerEmail = 'seller@redbank.com';
    let seller = await User.findOne({ email: sellerEmail });
    if (!seller) {
      const hash = await bcrypt.hash('seller123', 10);
      seller = new User({
        name: 'Demo Agent',
        email: sellerEmail,
        password: hash,
        role: 'seller',
        phone: '8888888888'
      });
      await seller.save();
      console.log('[SEED] Demo Seller Created.');
    }

    // 2. Clear & Seed Leads
    await Lead.deleteMany({});
    const leads = [
      { name: 'John Doe', email: 'john@example.com', phone: '9876543210', status: 'new', assignedTo: seller._id, source: 'Web' },
      { name: 'Jane Smith', email: 'jane@example.com', phone: '9876543211', status: 'contacted', assignedTo: seller._id, source: 'Referral' },
      { name: 'Alice Brown', email: 'alice@example.com', phone: '9876543212', status: 'qualified', assignedTo: seller._id, source: 'Walk-in' }
    ];
    await Lead.insertMany(leads);
    console.log('[SEED] Leads Seeded.');

    // 3. Seed Sales
    await Sale.deleteMany({});
    const sales = [
      { leadName: 'John Doe', amount: 50000, date: new Date(), seller: seller._id, status: 'completed' },
      { leadName: 'Jane Smith', amount: 75000, date: new Date(), seller: seller._id, status: 'completed' }
    ];
    await Sale.insertMany(sales);
    console.log('[SEED] Sales Seeded.');

    // 4. Seed Attendance
    await Attendance.deleteMany({});
    const attendance = [
      { sellerId: seller._id, date: new Date().toISOString().split('T')[0], status: 'present', checkIn: new Date(), mode: 'office' }
    ];
    await Attendance.insertMany(attendance);
    console.log('[SEED] Attendance Seeded.');

    console.log('[SEED] ✅ DATABASE SEED COMPLETE!');
  } catch (err) {
    console.error('[SEED ERROR]', err.message);
  }
};

module.exports = seedData;
