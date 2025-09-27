// App Lab Agent - Analytics Routes
// Analitik API endpoints

const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

// Event tracking
router.post('/track', (req, res) => {
  try {
    const { name, category, userId, projectId, properties, sessionId } = req.body;

    if (!name || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Event adı ve kullanıcı ID gerekli'
      });
    }

    const event = {
      name,
      category,
      userId,
      projectId,
      properties,
      sessionId,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };

    const result = analyticsService.trackEvent(event);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Session başlat
router.post('/session/start', (req, res) => {
  try {
    const { userId, device, browser, platform, referrer } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Kullanıcı ID gerekli'
      });
    }

    const sessionData = {
      device: device || req.get('User-Agent'),
      browser,
      platform,
      referrer
    };

    const result = analyticsService.startSession(userId, sessionData);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Session bitir
router.post('/session/:sessionId/end', (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = analyticsService.endSession(sessionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sayfa görüntüleme tracking
router.post('/pageview', (req, res) => {
  try {
    const { userId, sessionId, page, title, url, referrer, loadTime } = req.body;

    if (!userId || !sessionId || !page) {
      return res.status(400).json({
        success: false,
        error: 'Kullanıcı ID, session ID ve sayfa gerekli'
      });
    }

    const pageData = {
      userId,
      sessionId,
      page,
      title,
      url,
      referrer,
      loadTime
    };

    const result = analyticsService.trackPageView(pageData);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Performance metriği tracking
router.post('/performance', (req, res) => {
  try {
    const { name, value, unit, userId, projectId, metadata } = req.body;

    if (!name || value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Metric adı ve değeri gerekli'
      });
    }

    const metricData = {
      name,
      value,
      unit,
      userId,
      projectId,
      metadata
    };

    const result = analyticsService.trackPerformance(metricData);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Proje analitiği
router.get('/project/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const { timeRange = '7d' } = req.query;

    const analytics = analyticsService.getProjectAnalytics(projectId, timeRange);
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Kullanıcı analitiği
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { timeRange = '30d' } = req.query;

    const analytics = analyticsService.getUserAnalytics(userId, timeRange);
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sistem analitiği
router.get('/system', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const analytics = analyticsService.getSystemAnalytics(timeRange);
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Dashboard için özet veriler
router.get('/dashboard', (req, res) => {
  try {
    const { userId, timeRange = '7d' } = req.query;
    
    const systemAnalytics = analyticsService.getSystemAnalytics(timeRange);
    let userAnalytics = null;

    if (userId) {
      userAnalytics = analyticsService.getUserAnalytics(userId, timeRange);
    }

    res.json({
      success: true,
      system: systemAnalytics,
      user: userAnalytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analytics temizlik
router.post('/cleanup', (req, res) => {
  try {
    const { olderThanDays = 30 } = req.body;
    analyticsService.cleanup(olderThanDays);
    
    res.json({
      success: true,
      message: `${olderThanDays} günden eski veriler temizlendi`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;