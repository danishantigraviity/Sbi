const express = require('express');
const router = express.Router();
const { auth, tlOnly } = require('../middleware/auth');
const {
  getTLStats,
  getMyAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  getTLTasks,
  createTLTask,
  updateTLTask,
  deleteTLTask,
  getTLLeads,
  createTLLead,
  updateTLLead,
  deleteTLLead
} = require('../controllers/tlController');

// Dashboard
router.get('/stats', auth, tlOnly, getTLStats);

// Agent management
router.get('/agents', auth, tlOnly, getMyAgents);
router.post('/agents', auth, tlOnly, createAgent);
router.put('/agents/:id', auth, tlOnly, updateAgent);
router.delete('/agents/:id', auth, tlOnly, deleteAgent);

// Task management
router.get('/tasks', auth, tlOnly, getTLTasks);
router.post('/tasks', auth, tlOnly, createTLTask);
router.put('/task/:id', auth, tlOnly, updateTLTask);
router.delete('/task/:id', auth, tlOnly, deleteTLTask);

// Lead management
router.get('/leads', auth, tlOnly, getTLLeads);
router.post('/lead', auth, tlOnly, createTLLead);
router.put('/lead/:id', auth, tlOnly, updateTLLead);
router.delete('/lead/:id', auth, tlOnly, deleteTLLead);

module.exports = router;
