const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
  mode: { type: String, enum: ['office', 'online'], default: 'office' },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  breaks: [{
    type: { type: String, enum: ['15m', '30m', '15m'] },
    start: { type: Date },
    end: { type: Date }
  }],
  totalBreakTime: { type: Number, default: 0 }, // in minutes
  checkInFaceVerified: { type: Boolean, default: false },
  checkOutFaceVerified: { type: Boolean, default: false },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  shift: { type: String, enum: ['day', 'night'], default: 'day' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
