const User = require('../models/User');
const Attendance = require('../models/Attendance');
const LocationHistory = require('../models/LocationHistory');
const { calculateDistance, OFFICE_COORDS } = require('../utils/geo');

const activeUsers = new Map(); // Track active connections and status

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('[SOCKET] New connection:', socket.id);

    // Join room based on user role
    socket.on('register', async (data) => {
      const { userId, role } = data;
      if (!userId) return;

      socket.userId = userId;
      socket.role = role;
      
      // Fetch check-in location from attendance
      const today = new Date().toISOString().split('T')[0];
      const attendance = await Attendance.findOne({ sellerId: userId, date: today }).sort({ createdAt: -1 });

      activeUsers.set(userId, {
        socketId: socket.id,
        role,
        lastPing: Date.now(),
        status: 'online',
        location: null,
        checkInLocation: attendance?.location || null
      });

      // Join appropriate room
      socket.join(role === 'admin' ? 'admins' : 'sellers');
      console.log(`[SOCKET] User ${userId} (${role}) registered`);

      // Broadcast initial status to admins
      io.to('admins').emit('user-status-changed', {
        userId,
        status: 'online'
      });
    });

    // Handle incoming location data from sellers
    socket.on('update-location', async (data) => {
      const { userId, lat, lng } = data;
      if (!userId || !lat || !lng) return;

      // 1. Calculate Geo-fencing (200m office radius)
      const distance = calculateDistance(lat, lng, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
      const mode = distance <= 200 ? 'office' : 'online';

      // 2. Update Active User State
      const userData = activeUsers.get(userId);
      if (userData) {
        userData.lastPing = Date.now();
        userData.location = { lat, lng };
        userData.status = 'online';
        userData.mode = mode;

        // Ensure checkInLocation is available
        if (!userData.checkInLocation) {
          const today = new Date().toISOString().split('T')[0];
          const attendance = await Attendance.findOne({ sellerId: userId, date: today }).sort({ createdAt: -1 });
          userData.checkInLocation = attendance?.location || null;
        }
      }

      // 3. Log to History (Persistence)
      // We log every 1 minute or if significant movement detected to avoid db bloat
      const lastHistory = await LocationHistory.findOne({ userId }).sort({ timestamp: -1 });
      const shouldLog = !lastHistory || (Date.now() - lastHistory.timestamp > 60000);

      if (shouldLog) {
        await LocationHistory.create({
          userId,
          lat,
          lng,
          status: 'online',
          mode
        });
      }

      // 4. Broadcast to Admins
      io.to('admins').emit('location-broadcast', {
        userId,
        lat,
        lng,
        mode,
        status: 'online',
        checkInLocation: userData?.checkInLocation
      });
    });

    // Handle heartbeats (ping from client)
    socket.on('heartbeat', (data) => {
      const { userId } = data;
      const userData = activeUsers.get(userId);
      if (userData) {
        userData.lastPing = Date.now();
        userData.status = 'online';
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        // Mark user as offline
        activeUsers.delete(socket.userId);
        io.to('admins').emit('user-status-changed', {
          userId: socket.userId,
          status: 'offline'
        });
        console.log(`[SOCKET] User ${socket.userId} disconnected`);
      }
    });
  });

  // Background Task: Monitor Inactive Users (Heartbeat Check)
  setInterval(() => {
    const now = Date.now();
    activeUsers.forEach((data, userId) => {
      const diff = now - data.lastPing;
      
      // If no ping for > 30 seconds, mark as offline/idle
      if (diff > 30000 && data.status !== 'offline') {
        data.status = 'offline';
        io.to('admins').emit('user-status-changed', { userId, status: 'offline' });
      } else if (diff > 15000 && data.status === 'online') {
        // Between 15-30 seconds, mark as idle
        data.status = 'idle';
        io.to('admins').emit('user-status-changed', { userId, status: 'idle' });
      }
    });
  }, 10000); // Check every 10 seconds
};

module.exports = initSocket;
