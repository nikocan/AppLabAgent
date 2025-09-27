import express from 'express';
import { AIServiceClient } from '../services/aiService.js';
import { pool } from '../data/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// AI servisleri
router.post('/text-generate', authenticate, async (req, res) => {
  try {
    const { prompt } = req.body;
    const client = new AIServiceClient(process.env.RAPID_API_KEY);
    const result = await client.generateText(prompt);
    
    // Kullanım istatistiklerini kaydet
    await pool.query(
      'INSERT INTO api_usage (user_id, api_name, request_count) VALUES ($1, $2, 1) ON CONFLICT (user_id, api_name) DO UPDATE SET request_count = api_usage.request_count + 1, last_request_at = CURRENT_TIMESTAMP',
      [req.user.id, 'text-generation']
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/image-analyze', authenticate, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const client = new AIServiceClient(process.env.RAPID_API_KEY);
    const result = await client.analyzeImage(imageUrl);
    
    await pool.query(
      'INSERT INTO api_usage (user_id, api_name, request_count) VALUES ($1, $2, 1) ON CONFLICT (user_id, api_name) DO UPDATE SET request_count = api_usage.request_count + 1, last_request_at = CURRENT_TIMESTAMP',
      [req.user.id, 'image-analysis']
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Uygulama oluşturma servisleri
router.post('/app/create-web', authenticate, async (req, res) => {
  try {
    const { config } = req.body;
    const client = new AIServiceClient(process.env.RAPID_API_KEY);
    const result = await client.createWebApp(config);
    
    await pool.query(
      'INSERT INTO api_usage (user_id, api_name, request_count) VALUES ($1, $2, 1) ON CONFLICT (user_id, api_name) DO UPDATE SET request_count = api_usage.request_count + 1, last_request_at = CURRENT_TIMESTAMP',
      [req.user.id, 'web-app-creation']
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/app/create-mobile', authenticate, async (req, res) => {
  try {
    const { config } = req.body;
    const client = new AIServiceClient(process.env.RAPID_API_KEY);
    const result = await client.createMobileApp(config);
    
    await pool.query(
      'INSERT INTO api_usage (user_id, api_name, request_count) VALUES ($1, $2, 1) ON CONFLICT (user_id, api_name) DO UPDATE SET request_count = api_usage.request_count + 1, last_request_at = CURRENT_TIMESTAMP',
      [req.user.id, 'mobile-app-creation']
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/app/analytics/:appId', authenticate, async (req, res) => {
  try {
    const { appId } = req.params;
    const client = new AIServiceClient(process.env.RAPID_API_KEY);
    const result = await client.getAppAnalytics(appId);
    
    await pool.query(
      'INSERT INTO api_usage (user_id, api_name, request_count) VALUES ($1, $2, 1) ON CONFLICT (user_id, api_name) DO UPDATE SET request_count = api_usage.request_count + 1, last_request_at = CURRENT_TIMESTAMP',
      [req.user.id, 'analytics']
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;