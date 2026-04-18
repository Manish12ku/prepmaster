const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  syncUser,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserBlock,
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');

router.post('/sync', verifyToken, syncUser);
router.get('/profile', verifyToken, getUserProfile);
router.patch('/profile', verifyToken, updateUserProfile);
router.get('/', verifyToken, requireRole(['super_admin']), getAllUsers);
router.get('/:id', verifyToken, requireRole(['admin', 'super_admin']), getUserById);
router.patch('/:id/role', verifyToken, requireRole(['super_admin']), updateUserRole);
router.patch('/:id/block', verifyToken, requireRole(['super_admin']), toggleUserBlock);

module.exports = router;
