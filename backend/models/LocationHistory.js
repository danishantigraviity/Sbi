const mongoose = require('mongoose');

const locationHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  status: { type: String, enum: ['online', 'offline', 'idle'], default: 'online' },
  mode: { type: String, enum: ['office', 'online'], default: 'online' }, // Auto-calculated via geofence
  timestamp: { type: Date, default: Date.now }
});

// Index for faster queries on user history
locationHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('LocationHistory', locationHistorySchema);
