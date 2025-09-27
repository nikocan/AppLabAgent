const express = require('express');
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/authNew');

const router = express.Router();

// Korumalı route'lar
router.use(authenticate);

// AI Agent yönetimi
router.post('/agents', aiController.createAgent);
router.get('/agents', aiController.getAgents);
router.get('/agents/:agentId', aiController.getAgent);
router.put('/agents/:agentId', aiController.updateAgent);
router.delete('/agents/:agentId', aiController.deleteAgent);
router.post('/agents/:agentId/run', aiController.runAgent);

// AI Chat
router.post('/chat', aiController.chat);

// Kod analizi ve üretimi
router.post('/analyze-code', aiController.analyzeCode);
router.post('/generate-code', aiController.generateCode);

// AI Model listesi (public endpoint)
router.get('/models', aiController.getModels);

// Kullanım istatistikleri
router.get('/usage-stats', aiController.getUsageStats);

module.exports = router;