const express = require('express');
const router = express.Router();
const { 
  createLead, 
  getLeads,
  getSellerTasks, 
  updateTaskStatus,
  logCall, 
  checkIn, 
  checkOut, 
  createSale,
  getSellerStats,
  startBreak,
  endBreak,
  getMyAttendance 
} = require('../controllers/sellerController');
const { enrollFace, verifyFaceLogout } = require('../controllers/faceController');
const { auth, sellerOnly } = require('../middleware/auth');

router.get('/stats', auth, sellerOnly, getSellerStats);
router.get('/attendance-history', auth, sellerOnly, getMyAttendance);
router.post('/enroll-face', auth, sellerOnly, enrollFace);
router.post('/verify-logout', auth, verifyFaceLogout);
router.get('/leads', auth, sellerOnly, getLeads);
router.post('/leads', auth, sellerOnly, createLead);
router.get('/tasks', auth, sellerOnly, getSellerTasks);
router.put('/tasks/:id/status', auth, sellerOnly, updateTaskStatus);
router.post('/calls', auth, sellerOnly, logCall);
router.post('/checkin', auth, sellerOnly, checkIn);
router.post('/checkout', auth, sellerOnly, checkOut);
router.post('/start-break', auth, sellerOnly, startBreak);
router.post('/end-break', auth, sellerOnly, endBreak);
router.post('/sales', auth, sellerOnly, createSale);

module.exports = router;
