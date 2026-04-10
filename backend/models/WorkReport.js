const mongoose = require('mongoose');

const workReportSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  fileUrl: { type: String }, // Path to disk storage
  fileName: { type: String }, // Original file name
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WorkReport', workReportSchema);
