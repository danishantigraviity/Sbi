const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'tl', 'seller'], required: true },
  managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // TL who manages this seller
  phone: { type: String, required: true },
  faceEncodings: { type: [[Number]], default: [] },
  bioLoginFailures: { type: Number, default: 0 },
  bioLockoutUntil: { type: Date, default: null },
  workMode: { type: String, enum: ['idle', 'company', 'personal', 'office'], default: 'idle' },
  activeLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkLog', default: null },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
