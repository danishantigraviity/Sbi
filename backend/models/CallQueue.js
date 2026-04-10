const mongoose = require('mongoose');

const callQueueSchema = new mongoose.Schema({
  leadId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lead', 
    required: true 
  },
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'queued', 'calling', 'completed', 'failed', 'no-answer', 'busy'], 
    default: 'pending' 
  },
  attempts: { 
    type: Number, 
    default: 0 
  },
  maxRetries: { 
    type: Number, 
    default: 3 
  },
  lastAttempt: { 
    type: Date 
  },
  nextRetry: { 
    type: Date 
  },
  twilioCallSid: { 
    type: String 
  },
  recordingUrl: { 
    type: String 
  },
  duration: { 
    type: Number 
  },
  callOutcome: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('CallQueue', callQueueSchema);
