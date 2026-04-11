const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const crmRoutes = require('./routes/crmRoutes');
const { startAutocallWorker } = require('./services/autocallService');
const http = require('http');
const { Server } = require('socket.io');
const initSocket = require('./services/socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize Socket Handler
initSocket(io);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100 // relaxed for dev dashboard usage
});
app.use('/api/', limiter);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Routes
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/work', require('./routes/workRoutes'));
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Static Serving for Production (Monolith)
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
  
  // Serve static assets
  app.use(express.static(frontendPath));
  
  // Handle SPA routing - point all non-API routes to index.html
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // Simple dev message
  app.get('/', (req, res) => res.send('🚀 RedBank API is running in Development! Access the Dashboard via the Vite dev server.'));
}

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startAutocallWorker(); // Background task for CRM calls
});
