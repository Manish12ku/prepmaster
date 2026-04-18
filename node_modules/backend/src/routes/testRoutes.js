const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  getAvailableTests,
  getTestForAttempt
} = require('../controllers/testController');

router.get('/available', verifyToken, getAvailableTests);
router.get('/:id/attempt', verifyToken, getTestForAttempt);
router.post('/', verifyToken, requireRole(['admin', 'super_admin']), createTest);
router.get('/', verifyToken, getAllTests);
router.get('/:id', verifyToken, getTestById);
router.patch('/:id', verifyToken, requireRole(['admin', 'super_admin']), updateTest);
router.delete('/:id', verifyToken, requireRole(['admin', 'super_admin']), deleteTest);

module.exports = router;
