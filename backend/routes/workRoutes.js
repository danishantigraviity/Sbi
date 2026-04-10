const express = require('express');
const router = express.Router();
const { 
  startSession, 
  stopSession, 
  getPendingRequests, 
  handleRequest,
  getCurrentStatus,
  getWorkReport,
  getAdminWorkReport,
  getSellerRequests,
  submitManualReport,
  getManualReports
} = require('../controllers/workController');
const { auth, adminOnly, sellerOnly } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer Config for Manual Reports
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/reports/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Word documents are allowed'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Seller Endpoints
router.post('/start', auth, sellerOnly, startSession);
router.post('/stop', auth, sellerOnly, stopSession);
router.get('/status', auth, sellerOnly, getCurrentStatus);
router.get('/my-requests', auth, sellerOnly, getSellerRequests);
router.post('/manual-report', auth, sellerOnly, upload.single('reportFile'), submitManualReport);

// Admin / Shared Endpoints
router.get('/pending', auth, adminOnly, getPendingRequests);
router.post('/handle', auth, adminOnly, handleRequest);
router.get('/report', auth, sellerOnly, getWorkReport);
router.get('/admin/report', auth, adminOnly, getAdminWorkReport);
router.get('/manual-reports', auth, adminOnly, getManualReports);

module.exports = router;
