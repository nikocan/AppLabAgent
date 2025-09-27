// App Lab Agent - Notification Service
// Bildirim yönetimi için servis katmanı

const EventEmitter = require('events');

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.notifications = new Map();
    this.subscribers = new Map();
    this.channels = {
      EMAIL: 'email',
      SMS: 'sms',
      PUSH: 'push',
      WEBHOOK: 'webhook',
      IN_APP: 'in_app'
    };
  }

  // Bildirim oluştur
  async createNotification(notification) {
    const id = this.generateId();
    const newNotification = {
      id,
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      channel: notification.channel || this.channels.IN_APP,
      userId: notification.userId,
      projectId: notification.projectId,
      priority: notification.priority || 'normal',
      read: false,
      createdAt: new Date().toISOString(),
      scheduledAt: notification.scheduledAt || null,
      metadata: notification.metadata || {}
    };

    this.notifications.set(id, newNotification);

    // Eğer zamanlanmış değilse hemen gönder
    if (!notification.scheduledAt) {
      await this.sendNotification(newNotification);
    }

    this.emit('notification_created', newNotification);
    return { success: true, notification: newNotification };
  }

  // Bildirim gönder
  async sendNotification(notification) {
    try {
      switch (notification.channel) {
        case this.channels.EMAIL:
          await this.sendEmailNotification(notification);
          break;
        case this.channels.SMS:
          await this.sendSMSNotification(notification);
          break;
        case this.channels.PUSH:
          await this.sendPushNotification(notification);
          break;
        case this.channels.WEBHOOK:
          await this.sendWebhookNotification(notification);
          break;
        case this.channels.IN_APP:
          await this.sendInAppNotification(notification);
          break;
      }

      // Bildirim durumunu güncelle
      notification.sentAt = new Date().toISOString();
      notification.status = 'sent';
      
      this.emit('notification_sent', notification);
      return { success: true, message: 'Notification sent successfully' };
    } catch (error) {
      notification.status = 'failed';
      notification.error = error.message;
      
      this.emit('notification_failed', notification);
      return { success: false, error: error.message };
    }
  }

  // E-posta bildirimi gönder
  async sendEmailNotification(notification) {
    console.log(`📧 Email notification sent to user ${notification.userId}: ${notification.title}`);
    // Gerçek e-posta servisi entegrasyonu burada olacak (SendGrid, SES, etc.)
  }

  // SMS bildirimi gönder
  async sendSMSNotification(notification) {
    console.log(`📱 SMS notification sent to user ${notification.userId}: ${notification.title}`);
    // SMS servisi entegrasyonu burada olacak (Twilio, AWS SNS, etc.)
  }

  // Push bildirimi gönder
  async sendPushNotification(notification) {
    console.log(`🔔 Push notification sent to user ${notification.userId}: ${notification.title}`);
    // Push notification servisi entegrasyonu burada olacak (FCM, APNS, etc.)
  }

  // Webhook bildirimi gönder
  async sendWebhookNotification(notification) {
    console.log(`🔗 Webhook notification sent for user ${notification.userId}: ${notification.title}`);
    // HTTP webhook çağrısı burada yapılacak
  }

  // Uygulama içi bildirim gönder
  async sendInAppNotification(notification) {
    console.log(`🔔 In-app notification created for user ${notification.userId}: ${notification.title}`);
    // WebSocket veya real-time connection üzerinden gönderilecek
  }

  // Kullanıcı bildirimlerini getir
  getUserNotifications(userId, options = {}) {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (options.unreadOnly) {
      return userNotifications.filter(n => !n.read);
    }

    if (options.limit) {
      return userNotifications.slice(0, options.limit);
    }

    return userNotifications;
  }

  // Bildirim okundu olarak işaretle
  markAsRead(notificationId, userId) {
    const notification = this.notifications.get(notificationId);
    if (notification && notification.userId === userId) {
      notification.read = true;
      notification.readAt = new Date().toISOString();
      this.emit('notification_read', notification);
      return { success: true };
    }
    return { success: false, error: 'Notification not found' };
  }

  // Tüm bildirimleri okundu olarak işaretle
  markAllAsRead(userId) {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId && !n.read);

    userNotifications.forEach(notification => {
      notification.read = true;
      notification.readAt = new Date().toISOString();
    });

    this.emit('notifications_bulk_read', { userId, count: userNotifications.length });
    return { success: true, marked: userNotifications.length };
  }

  // Bildirim sil
  deleteNotification(notificationId, userId) {
    const notification = this.notifications.get(notificationId);
    if (notification && notification.userId === userId) {
      this.notifications.delete(notificationId);
      this.emit('notification_deleted', notification);
      return { success: true };
    }
    return { success: false, error: 'Notification not found' };
  }

  // Abonelik ekle
  subscribe(userId, channel, preferences = {}) {
    const subscription = {
      userId,
      channel,
      preferences,
      createdAt: new Date().toISOString(),
      active: true
    };

    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, []);
    }

    this.subscribers.get(userId).push(subscription);
    this.emit('user_subscribed', subscription);
    return { success: true, subscription };
  }

  // Abonelik iptal et
  unsubscribe(userId, channel) {
    const userSubscriptions = this.subscribers.get(userId) || [];
    const updatedSubscriptions = userSubscriptions.filter(s => s.channel !== channel);
    
    this.subscribers.set(userId, updatedSubscriptions);
    this.emit('user_unsubscribed', { userId, channel });
    return { success: true };
  }

  // ID generator
  generateId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Sistem bildirimleri için helper metodlar
  async notifyProjectCreated(projectId, userId) {
    return await this.createNotification({
      title: 'Yeni Proje Oluşturuldu',
      message: `Proje başarıyla oluşturuldu: ${projectId}`,
      type: 'success',
      userId,
      projectId,
      channel: this.channels.IN_APP
    });
  }

  async notifyBuildCompleted(buildId, projectId, userId, success = true) {
    return await this.createNotification({
      title: success ? 'Build Tamamlandı' : 'Build Başarısız',
      message: success ? 
        `Build başarıyla tamamlandı: ${buildId}` : 
        `Build başarısız oldu: ${buildId}`,
      type: success ? 'success' : 'error',
      userId,
      projectId,
      channel: this.channels.IN_APP,
      metadata: { buildId }
    });
  }

  async notifyDeploymentStatus(deploymentId, projectId, userId, status) {
    return await this.createNotification({
      title: 'Deployment Durumu',
      message: `Deployment durumu: ${status}`,
      type: status === 'success' ? 'success' : 'warning',
      userId,
      projectId,
      channel: this.channels.IN_APP,
      metadata: { deploymentId, status }
    });
  }

  // Bildirim istatistikleri
  getNotificationStats(userId) {
    const userNotifications = this.getUserNotifications(userId);
    return {
      total: userNotifications.length,
      unread: userNotifications.filter(n => !n.read).length,
      byType: userNotifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {}),
      byChannel: userNotifications.reduce((acc, n) => {
        acc[n.channel] = (acc[n.channel] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

module.exports = new NotificationService();