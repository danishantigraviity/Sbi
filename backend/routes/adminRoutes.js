const express = require('express');
const router = express.Router();
const { 
  getAllSellers, 
  getAllTasks,
  createTask, 
  getAdminStats, 
  getAttendance, 
  updateSeller, 
  deleteSeller,
  getAllCalls,
  getAllSales,
  updateSaleStatus,
  getAllLeads,
  updateTask,
  deleteTask,
  createLead,
  updateLead,
  deleteLead,
  deleteSale,
  getLocationHistory,
  getAgentAttendanceHistory,
  getActiveTrackingSessions
} = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/sellers', auth, adminOnly, getAllSellers);
router.get('/tasks', auth, adminOnly, getAllTasks);
router.post('/tasks', auth, adminOnly, createTask);
router.get('/stats', auth, adminOnly, getAdminStats);
router.get('/attendance', auth, adminOnly, getAttendance);
router.get('/calls', auth, adminOnly, getAllCalls);
router.get('/sales', auth, adminOnly, getAllSales);
router.get('/leads', auth, adminOnly, getAllLeads);
router.put('/sales/:id/status', auth, adminOnly, updateSaleStatus);
router.put('/seller/:id', auth, adminOnly, updateSeller);
router.delete('/seller/:id', auth, adminOnly, deleteSeller);
router.put('/task/:id', auth, adminOnly, updateTask);
router.delete('/task/:id', auth, adminOnly, deleteTask);
router.post('/lead', auth, adminOnly, createLead);
router.put('/lead/:id', auth, adminOnly, updateLead);
router.delete('/lead/:id', auth, adminOnly, deleteLead);
router.delete('/sale/:id', auth, adminOnly, deleteSale);
router.get('/seller/:id/history', auth, adminOnly, getLocationHistory);
router.get('/seller/:id/attendance', auth, adminOnly, getAgentAttendanceHistory);
router.get('/tracking/active', auth, adminOnly, getActiveTrackingSessions);

module.exports = router;
