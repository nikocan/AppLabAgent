const express = require('express');
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// AI Agent yönetimi
router.post('/agents', aiController.createAgent);

// AI Chat
router.post('/chat', aiController.chat);

module.exports = router;