const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const bcrypt = require('bcryptjs');
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
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in environment variables.');
}

mongoose.connect(mongoURI || 'mongodb://localhost:27017/sbi_fallback')
  .then(() => console.log('Connected to MongoDB Successfully'))
  .catch(err => console.error('Could not connect to MongoDB:', err.message));

app.set('trust proxy', 1); // Required for Render/Vercel rate limiting to work correctly

// Ensure Uploads Directory Exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('[SYSTEM] Created missing uploads directory');
}

// Auto-Seed Admin Function
const seedAdmin = async () => {
    try {
        const User = require('./models/User');
        const adminEmail = 'admin@redbank.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = new User({
                name: 'System Administrator',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                phone: '9999999999'
            });
            await admin.save();
            console.log('[SEED] Default Admin created (admin@redbank.com / admin123)');
        } else {
            console.log('[SEED] Admin account verified.');
        }
    } catch (err) {
        console.error('[SEED ERROR] Could not verify/seed admin:', err.message);
    }
};

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
  const fs = require('fs');
  // Check multiple possible paths for the dist folder to be super safe
  const possiblePaths = [
    path.join(__dirname, '..', 'frontend', 'dist'),
    path.join(__dirname, 'frontend', 'dist'), // For some build structures
    path.join(process.cwd(), 'frontend', 'dist'),
    path.join(process.cwd(), 'dist')
  ];

  let frontendPath = possiblePaths[0];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      frontendPath = p;
      break;
    }
  }
  
  console.log(`[DEPLOY DEBUG] Final frontend path: ${frontendPath}`);
  if (!fs.existsSync(path.join(frontendPath, 'index.html'))) {
    console.error(`[DEPLOY DEBUG] ERROR: index.html NOT FOUND at ${frontendPath}`);
  } else {
    console.log(`[DEPLOY DEBUG] SUCCESS: index.html found.`);
  }
  
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
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedAdmin(); // Ensure admin exists on every startup
  startAutocallWorker(); // Background task for CRM calls
});
