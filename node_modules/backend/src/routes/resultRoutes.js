const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  submitResult,
  getUserResults,
  getResultsByTest,
  getResultById,
  getPlatformAnalytics,
  getStudentPerformance,
  getPausedResult,
  savePausedResult
} = require('../controllers/resultController');

router.post('/', verifyToken, submitResult);
router.post('/pause', verifyToken, savePausedResult);
router.get('/paused/:testId', verifyToken, getPausedResult);
router.get('/analytics/platform', verifyToken, requireRole(['super_admin']), getPlatformAnalytics);
router.get('/test/:testId', verifyToken, requireRole(['admin', 'super_admin']), getResultsByTest);
router.get('/user/:userId', verifyToken, getUserResults);
router.get('/student/:userId/performance', verifyToken, requireRole(['admin', 'super_admin']), getStudentPerformance);
router.get('/:id', verifyToken, getResultById);

module.exports = router;
