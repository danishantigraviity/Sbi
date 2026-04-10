const CallQueue = require('../models/CallQueue');
const twilio = require('twilio');

// Mock Dialer for development
const mockDial = async (phoneNumber) => {
  return new Promise((resolve) => {
    console.log(`[MOCK DIALER] Initiating call to: ${phoneNumber}...`);
    setTimeout(() => {
      const outcomes = ['completed', 'completed', 'no-answer', 'busy', 'failed'];
      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      console.log(`[MOCK DIALER] Call to ${phoneNumber} resulted in: ${result}`);
      resolve({
        sid: 'MOCK_' + Math.random().toString(36).substr(2, 9),
        status: result
      });
    }, 3000); // Simulate 3 second dial/connect time
  });
};

const processQueue = async () => {
  try {
    // Find one pending item
    // In a real production app, you'd use a more robust locking mechanism
    const queueItem = await CallQueue.findOne({ 
      status: { $in: ['pending', 'retry'] },
      $or: [
        { nextRetry: { $exists: false } },
        { nextRetry: { $lte: new Date() } }
      ]
    });

    if (!queueItem) return;

    console.log(`[AUTOCALL] Processing queue item for: ${queueItem.phoneNumber}`);
    
    queueItem.status = 'calling';
    queueItem.attempts += 1;
    queueItem.lastAttempt = new Date();
    await queueItem.save();

    // Use Twilio if credentials exist, otherwise fallback to mock
    let callResult;
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      try {
        const call = await client.calls.create({
          url: 'http://demo.twilio.com/docs/voice.xml', // Replace with your TwiML bin or webhook
          to: queueItem.phoneNumber,
          from: process.env.TWILIO_PHONE_NUMBER
        });
        callResult = { sid: call.sid, status: 'queued' };
      } catch (err) {
        console.error('[TWILIO ERROR]', err.message);
        callResult = { sid: 'ERROR', status: 'failed' };
      }
    } else {
      callResult = await mockDial(queueItem.phoneNumber);
    }

    queueItem.twilioCallSid = callResult.sid;
    
    if (callResult.status === 'completed') {
      queueItem.status = 'completed';
    } else if (['no-answer', 'busy', 'failed'].includes(callResult.status)) {
      if (queueItem.attempts < queueItem.maxRetries) {
        queueItem.status = 'retry';
        // Staggered retry: 10 mins * attempts
        queueItem.nextRetry = new Date(Date.now() + (10 * 60 * 1000 * queueItem.attempts));
      } else {
        queueItem.status = 'failed';
      }
    } else {
       // 'queued' or 'in-progress' - will need a webhook for final update
       // For mock, it resolves to completed/failed immediately
       queueItem.status = callResult.status;
    }

    await queueItem.save();

  } catch (err) {
    console.error('[AUTOCALL WORKER ERROR]', err);
  }
};

// Run worker every 15 seconds
const startAutocallWorker = () => {
  console.log('--- STARTING AUTOCALL BACKGROUND WORKER ---');
  setInterval(processQueue, 15000);
};

module.exports = { startAutocallWorker };
