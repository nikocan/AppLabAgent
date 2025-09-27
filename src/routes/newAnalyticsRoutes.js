const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/authNew');

const router = express.Router();

// Event tracking (korumasız - tracking için)
router.post('/track', analyticsController.trackEvent);

// Korumalı route'lar
router.use(authenticate);

// Event yönetimi
router.get('/events', analyticsController.getEvents);

// Kullanıcı metrikleri
router.get('/user-metrics', analyticsController.getUserMetrics);

// Proje metrikleri  
router.get('/project/:projectId/metrics', analyticsController.getProjectMetrics);

// Platform istatistikleri (Admin only)
router.get('/platform-stats', analyticsController.getPlatformStats);

// Performans metrikleri
router.get('/performance', analyticsController.getPerformanceMetrics);

// Kullanıcı aktivitesi
router.get('/user-activity', analyticsController.getUserActivity);

// Conversion funnel
router.get('/funnel', analyticsController.getConversionFunnel);

// Cohort analizi
router.get('/cohort', analyticsController.getCohortAnalysis);

// Custom query
router.post('/query', analyticsController.customQuery);

// Dashboard verileri
router.get('/dashboard', analyticsController.getDashboardData);

module.exports = router;