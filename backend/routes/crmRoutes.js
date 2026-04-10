const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, adminOnly } = require('../middleware/auth');
const crmController = require('../controllers/crmController');

// Multer Storage for lead files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/leads/');
  },
  filename: (req, file, cb) => {
    cb(null, `leads-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.xlsx', '.xls', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and PDF files are allowed'), false);
    }
  }
});

// Bulk Upload leads (Excel/PDF)
router.post('/upload', auth, adminOnly, upload.single('leadsFile'), crmController.bulkUploadLeads);

// Get real-time queue status
router.get('/queue', auth, adminOnly, crmController.getQueueStatus);

// Get campaign analytics
router.get('/analytics', auth, adminOnly, crmController.getAnalytics);

module.exports = router;
