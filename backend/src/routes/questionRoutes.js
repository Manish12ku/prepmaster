const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  approveQuestion,
  bulkUploadQuestions,
  getSubjects,
  getTopicsBySubject
} = require('../controllers/questionController');

const upload = multer({ dest: 'uploads/' });

router.get('/subjects', verifyToken, getSubjects);
router.get('/subjects/:subject/topics', verifyToken, getTopicsBySubject);
router.post('/', verifyToken, requireRole(['admin', 'super_admin']), createQuestion);
router.post('/bulk', verifyToken, requireRole(['admin', 'super_admin']), upload.single('file'), bulkUploadQuestions);
router.get('/', verifyToken, getAllQuestions);
router.get('/:id', verifyToken, getQuestionById);
router.patch('/:id', verifyToken, requireRole(['admin', 'super_admin']), updateQuestion);
router.delete('/:id', verifyToken, requireRole(['super_admin']), deleteQuestion);
router.patch('/:id/approve', verifyToken, requireRole(['super_admin']), approveQuestion);

module.exports = router;
