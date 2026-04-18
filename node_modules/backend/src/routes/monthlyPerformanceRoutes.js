const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getStudentMonthlyPerformance,
  getTopMonthlyPerformers,
  getAllMonthlyPerformance,
  recalculateMonthlyPerformance
} = require('../controllers/monthlyPerformanceController');

// Routes accessible to all authenticated users
router.get('/top-performers', verifyToken, getTopMonthlyPerformers);
router.get('/student', verifyToken, getStudentMonthlyPerformance);

// Admin routes
router.get('/all', verifyToken, requireRole(['admin', 'super_admin']), getAllMonthlyPerformance);
router.post('/recalculate', verifyToken, requireRole(['super_admin']), recalculateMonthlyPerformance);

module.exports = router;
