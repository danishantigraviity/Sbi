const mongoose = require('mongoose');

const workLogSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mode: { type: String, enum: ['company', 'personal', 'office'], required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number }, // actual duration in minutes
  requestedDuration: { type: Number }, // targeted duration in hours or minutes (as specified in request)
  reason: { type: String }, // Required for 'personal' requests
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: function() {
      return this.mode === 'company' ? 'approved' : 'pending';
    } 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WorkLog', workLogSchema);
