const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { auth, adminOnly, sellerOnly } = require('../middleware/auth');

// Seller routes
router.post('/request', auth, sellerOnly, leaveController.requestLeave);
router.get('/my', auth, sellerOnly, leaveController.getSellerLeaves);

// Admin routes
router.get('/admin/all', auth, adminOnly, leaveController.getAllLeavesAdmin);
router.put('/admin/update/:id', auth, adminOnly, leaveController.updateLeaveStatus);

module.exports = router;
