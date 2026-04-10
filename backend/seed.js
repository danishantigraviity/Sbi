const mongoose = require('mongoose');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define schema inline to avoid import issues for seeding
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['admin', 'seller'], required: true },
      phone: { type: String, required: true }
    });

    // Hash password before saving (same as in model)
    userSchema.pre('save', async function () {
      if (!this.isModified('password')) return;
      const bcrypt = require('bcryptjs');
      this.password = await bcrypt.hash(this.password, 10);
    });

    const SeedUser = mongoose.models.User || mongoose.model('User', userSchema);
    
    const adminExists = await SeedUser.findOne({ email: 'admin@redbank.com' });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const admin = new SeedUser({
      name: 'Redbank Admin',
      email: 'admin@redbank.com',
      password: 'admin123',
      role: 'admin',
      phone: '1234567890'
    });

    await admin.save();
    console.log('--- SEED SUCCESSFUL ---');
    console.log('Admin Account Created!');
    console.log('Email: admin@redbank.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err.message);
    process.exit(1);
  }
};

seedAdmin();
