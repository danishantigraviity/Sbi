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
const tlRoutes = require('./routes/tlRoutes');
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
            const admin = new User({
                name: 'System Administrator',
                email: adminEmail,
                password: 'admin123',
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

// Auto-Seed TL Function
const seedTL = async () => {
    try {
        const User = require('./models/User');
        const tlEmail = 'tl@redbank.com';
        const existingTL = await User.findOne({ email: tlEmail });
        if (!existingTL) {
            const tl = new User({
                name: 'Team Lead',
                email: tlEmail,
                password: 'tl123',
                role: 'tl',
                phone: '8888888888'
            });
            await tl.save();
            console.log('[SEED] Default TL created (tl@redbank.com / tl123)');
        } else {
            console.log('[SEED] TL account verified.');
        }
    } catch (err) {
        console.error('[SEED ERROR] Could not verify/seed TL:', err.message);
    }
};

// Routes
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/tl', tlRoutes);
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/work', require('./routes/workRoutes'));
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Static Serving - AGGRESSIVE MODE for Render
const isProd = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

if (isProd) {
  const path = require('path');
  const fs = require('fs');
  
  // List of possible locations for the site files
  const possiblePaths = [
    path.join(__dirname, '..', 'frontend', 'dist'),
    path.join(__dirname, 'dist'),
    path.join(process.cwd(), 'frontend', 'dist'),
    path.join(process.cwd(), 'dist'),
    '/opt/render/project/src/frontend/dist' // Explicit Render path
  ];

  let frontendPath = possiblePaths[0];
  console.log('[DEPLOY] Scanning for frontend assets...');
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
      frontendPath = p;
      console.log(`[DEPLOY] ✅ FOUND index.html at: ${p}`);
      break;
    } else {
      console.log(`[DEPLOY] ❌ No index.html at: ${p}`);
    }
  }
  
  // Serve static assets
  app.use(express.static(frontendPath));
  
  // Handle SPA routing - point all non-API routes to index.html
  app.get(/^(?!\/api).*/, (req, res) => {
    const indexPath = path.join(frontendPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send(`<h1>Frontend Not Found</h1><p>Expected at: ${indexPath}</p><p>Please check Render build logs.</p>`);
    }
  });
} else {
  // Simple dev message
  app.get('/', (req, res) => res.send('🚀 RedBank API is running in Development!'));
}

const PORT = process.env.PORT || 5001;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedAdmin(); // Ensure admin exists
  await seedTL();    // Ensure default TL exists
  const seedDashboard = require('./seed_dashboard');
  await seedDashboard(); // Ensure dashboard has data
  startAutocallWorker(); // Background task for CRM calls
});
