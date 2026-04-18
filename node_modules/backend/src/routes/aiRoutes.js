const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { evaluateAnswer } = require('../controllers/aiController');

router.post('/evaluate-answer', verifyToken, evaluateAnswer);

module.exports = router;
