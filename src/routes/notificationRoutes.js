// App Lab Agent - Notification Routes
// Bildirim yönetimi API endpoints

const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

// Yeni bildirim oluştur
router.post('/create', async (req, res) => {
  try {
    const { title, message, type, userId, projectId, channel, priority, scheduledAt, metadata } = req.body;

    if (!title || !message || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Başlık, mesaj ve kullanıcı ID gerekli'
      });
    }

    const result = await notificationService.createNotification({
      title,
      message,
      type,
      userId,
      projectId,
      channel,
      priority,
      scheduledAt,
      metadata
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Kullanıcının bildirimlerini getir
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { unreadOnly, limit } = req.query;

    const notifications = notificationService.getUserNotifications(userId, {
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit) : undefined
    });

    res.json({
      success: true,
      notifications,
      total: notifications.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bildirimi okundu olarak işaretle
router.put('/:notificationId/read', (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Kullanıcı ID gerekli'
      });
    }

    const result = notificationService.markAsRead(notificationId, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Tüm bildirimleri okundu olarak işaretle
router.put('/user/:userId/read-all', (req, res) => {
  try {
    const { userId } = req.params;
    const result = notificationService.markAllAsRead(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bildirim sil
router.delete('/:notificationId', (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Kullanıcı ID gerekli'
      });
    }

    const result = notificationService.deleteNotification(notificationId, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Abonelik oluştur
router.post('/subscribe', (req, res) => {
  try {
    const { userId, channel, preferences } = req.body;

    if (!userId || !channel) {
      return res.status(400).json({
        success: false,
        error: 'Kullanıcı ID ve kanal gerekli'
      });
    }

    const result = notificationService.subscribe(userId, channel, preferences);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Abonelik iptal et
router.post('/unsubscribe', (req, res) => {
  try {
    const { userId, channel } = req.body;

    if (!userId || !channel) {
      return res.status(400).json({
        success: false,
        error: 'Kullanıcı ID ve kanal gerekli'
      });
    }

    const result = notificationService.unsubscribe(userId, channel);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bildirim istatistikleri
router.get('/stats/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const stats = notificationService.getNotificationStats(userId);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;