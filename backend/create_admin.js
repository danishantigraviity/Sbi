const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function createAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Load User Model - using raw collection to avoid schema issues during seeding
    const User = require('./models/User');
    
    const adminEmail = 'admin@redbank.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Delete existing admin if any (to reset)
    await User.deleteOne({ email: adminEmail });

    const adminUser = new User({
      name: 'System Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      phone: '9999999999',
      createdAt: new Date()
    });

    await adminUser.save();
    
    console.log('--- ADMIN CREATED ---');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('----------------------');
    console.log('You can now log in to the Live site!');
    
    process.exit(0);
  } catch (err) {
    console.error('Creation Error:', err.message);
    process.exit(1);
  }
}

createAdmin();
