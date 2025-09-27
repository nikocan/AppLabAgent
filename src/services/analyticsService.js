// App Lab Agent - Analytics Service
// Analitik ve metrik toplama servisi

const EventEmitter = require('events');

class AnalyticsService extends EventEmitter {
  constructor() {
    super();
    this.metrics = new Map();
    this.events = [];
    this.sessions = new Map();
    this.userActions = new Map();
    this.performanceMetrics = new Map();
  }

  // Event tracking
  trackEvent(event) {
    const trackedEvent = {
      id: this.generateId(),
      name: event.name,
      category: event.category || 'general',
      userId: event.userId,
      projectId: event.projectId,
      properties: event.properties || {},
      timestamp: new Date().toISOString(),
      sessionId: event.sessionId,
      userAgent: event.userAgent,
      ip: event.ip
    };

    this.events.push(trackedEvent);
    this.emit('event_tracked', trackedEvent);

    // User actions güncelle
    this.updateUserActions(event.userId, event.name);

    return { success: true, event: trackedEvent };
  }

  // Kullanıcı eylemlerini güncelle
  updateUserActions(userId, actionName) {
    if (!this.userActions.has(userId)) {
      this.userActions.set(userId, {});
    }

    const userActions = this.userActions.get(userId);
    userActions[actionName] = (userActions[actionName] || 0) + 1;
    userActions.lastActivity = new Date().toISOString();
  }

  // Session başlat
  startSession(userId, sessionData = {}) {
    const sessionId = this.generateId();
    const session = {
      id: sessionId,
      userId,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null,
      pageViews: 0,
      events: [],
      device: sessionData.device || 'unknown',
      browser: sessionData.browser || 'unknown',
      platform: sessionData.platform || 'unknown',
      referrer: sessionData.referrer || null,
      active: true
    };

    this.sessions.set(sessionId, session);
    this.emit('session_started', session);

    return { success: true, sessionId };
  }

  // Session bitir
  endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    session.endTime = new Date().toISOString();
    session.duration = new Date(session.endTime) - new Date(session.startTime);
    session.active = false;

    this.emit('session_ended', session);
    return { success: true, session };
  }

  // Sayfa görüntüleme tracking
  trackPageView(pageData) {
    const pageView = {
      id: this.generateId(),
      userId: pageData.userId,
      sessionId: pageData.sessionId,
      page: pageData.page,
      title: pageData.title,
      url: pageData.url,
      referrer: pageData.referrer,
      timestamp: new Date().toISOString(),
      loadTime: pageData.loadTime || null,
      timeOnPage: null
    };

    // Session'a sayfa görüntüleme ekle
    const session = this.sessions.get(pageData.sessionId);
    if (session) {
      session.pageViews++;
      session.events.push(pageView);
    }

    this.trackEvent({
      name: 'page_view',
      category: 'navigation',
      userId: pageData.userId,
      sessionId: pageData.sessionId,
      properties: pageView
    });

    return { success: true, pageView };
  }

  // Performance metrikleri
  trackPerformance(metricData) {
    const metric = {
      id: this.generateId(),
      name: metricData.name,
      value: metricData.value,
      unit: metricData.unit || 'ms',
      userId: metricData.userId,
      projectId: metricData.projectId,
      timestamp: new Date().toISOString(),
      metadata: metricData.metadata || {}
    };

    if (!this.performanceMetrics.has(metricData.name)) {
      this.performanceMetrics.set(metricData.name, []);
    }

    this.performanceMetrics.get(metricData.name).push(metric);
    this.emit('performance_tracked', metric);

    return { success: true, metric };
  }

  // Proje analitiği
  getProjectAnalytics(projectId, timeRange = '7d') {
    const startDate = this.getStartDate(timeRange);
    const projectEvents = this.events.filter(e => 
      e.projectId === projectId && 
      new Date(e.timestamp) >= startDate
    );

    const analytics = {
      projectId,
      timeRange,
      totalEvents: projectEvents.length,
      uniqueUsers: new Set(projectEvents.map(e => e.userId)).size,
      eventsByCategory: this.groupBy(projectEvents, 'category'),
      eventsByName: this.groupBy(projectEvents, 'name'),
      dailyActivity: this.getDailyActivity(projectEvents),
      topUsers: this.getTopUsers(projectEvents),
      averageSessionDuration: this.getAverageSessionDuration(projectId, startDate)
    };

    return analytics;
  }

  // Kullanıcı analitiği
  getUserAnalytics(userId, timeRange = '30d') {
    const startDate = this.getStartDate(timeRange);
    const userEvents = this.events.filter(e => 
      e.userId === userId && 
      new Date(e.timestamp) >= startDate
    );

    const userSessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId && new Date(s.startTime) >= startDate);

    const analytics = {
      userId,
      timeRange,
      totalEvents: userEvents.length,
      totalSessions: userSessions.length,
      totalSessionDuration: userSessions.reduce((acc, s) => acc + (s.duration || 0), 0),
      averageSessionDuration: userSessions.length ? 
        userSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / userSessions.length : 0,
      eventsByCategory: this.groupBy(userEvents, 'category'),
      eventsByName: this.groupBy(userEvents, 'name'),
      dailyActivity: this.getDailyActivity(userEvents),
      mostUsedFeatures: this.getMostUsedFeatures(userId),
      lastActivity: userEvents.length ? userEvents[userEvents.length - 1].timestamp : null
    };

    return analytics;
  }

  // Genel sistem analitiği
  getSystemAnalytics(timeRange = '7d') {
    const startDate = this.getStartDate(timeRange);
    const recentEvents = this.events.filter(e => new Date(e.timestamp) >= startDate);
    const recentSessions = Array.from(this.sessions.values())
      .filter(s => new Date(s.startTime) >= startDate);

    return {
      timeRange,
      overview: {
        totalEvents: recentEvents.length,
        totalUsers: new Set(recentEvents.map(e => e.userId)).size,
        totalSessions: recentSessions.length,
        activeUsers: this.getActiveUsers(startDate).length
      },
      events: {
        byCategory: this.groupBy(recentEvents, 'category'),
        byName: this.groupBy(recentEvents, 'name'),
        dailyBreakdown: this.getDailyActivity(recentEvents)
      },
      users: {
        newUsers: this.getNewUsers(startDate).length,
        returningUsers: this.getReturningUsers(startDate).length,
        topActiveUsers: this.getTopUsers(recentEvents, 10)
      },
      performance: this.getPerformanceOverview(startDate),
      trends: this.getTrends(timeRange)
    };
  }

  // En çok kullanılan özellikleri getir
  getMostUsedFeatures(userId) {
    const userActions = this.userActions.get(userId) || {};
    return Object.entries(userActions)
      .filter(([key]) => key !== 'lastActivity')
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));
  }

  // Aktif kullanıcıları getir
  getActiveUsers(startDate) {
    return Array.from(this.userActions.keys())
      .filter(userId => {
        const userActions = this.userActions.get(userId);
        return userActions.lastActivity && new Date(userActions.lastActivity) >= startDate;
      });
  }

  // Yeni kullanıcıları getir
  getNewUsers(startDate) {
    const userFirstEvents = new Map();
    this.events.forEach(event => {
      if (!userFirstEvents.has(event.userId) || 
          new Date(event.timestamp) < new Date(userFirstEvents.get(event.userId))) {
        userFirstEvents.set(event.userId, event.timestamp);
      }
    });

    return Array.from(userFirstEvents.entries())
      .filter(([, firstEvent]) => new Date(firstEvent) >= startDate)
      .map(([userId]) => userId);
  }

  // Dönen kullanıcıları getir
  getReturningUsers(startDate) {
    const newUsers = new Set(this.getNewUsers(startDate));
    return this.getActiveUsers(startDate).filter(userId => !newUsers.has(userId));
  }

  // Performance overview
  getPerformanceOverview(startDate) {
    const recentMetrics = new Map();
    
    this.performanceMetrics.forEach((metrics, name) => {
      const recentMetricsForName = metrics.filter(m => new Date(m.timestamp) >= startDate);
      if (recentMetricsForName.length > 0) {
        const values = recentMetricsForName.map(m => m.value);
        recentMetrics.set(name, {
          count: values.length,
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          latest: recentMetricsForName[recentMetricsForName.length - 1]
        });
      }
    });

    return Object.fromEntries(recentMetrics);
  }

  // Trend analizi
  getTrends(timeRange) {
    const periods = this.getPeriods(timeRange);
    const trends = {};

    periods.forEach((period, index) => {
      const periodEvents = this.events.filter(e => 
        new Date(e.timestamp) >= period.start && 
        new Date(e.timestamp) < period.end
      );

      trends[period.label] = {
        events: periodEvents.length,
        users: new Set(periodEvents.map(e => e.userId)).size,
        sessions: Array.from(this.sessions.values()).filter(s => 
          new Date(s.startTime) >= period.start && 
          new Date(s.startTime) < period.end
        ).length
      };
    });

    return trends;
  }

  // Yardımcı metodlar
  generateId() {
    return `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStartDate(timeRange) {
    const now = new Date();
    const ranges = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    };
    return new Date(now.getTime() - (ranges[timeRange] || ranges['7d']));
  }

  groupBy(array, key) {
    return array.reduce((acc, item) => {
      const group = item[key];
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});
  }

  getDailyActivity(events) {
    const daily = {};
    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      daily[date] = (daily[date] || 0) + 1;
    });
    return daily;
  }

  getTopUsers(events, limit = 5) {
    const userCounts = this.groupBy(events, 'userId');
    return Object.entries(userCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([userId, count]) => ({ userId, count }));
  }

  getAverageSessionDuration(projectId, startDate) {
    const projectSessions = Array.from(this.sessions.values())
      .filter(s => s.events.some(e => e.projectId === projectId) && 
                   new Date(s.startTime) >= startDate &&
                   s.duration);
    
    if (projectSessions.length === 0) return 0;
    
    return projectSessions.reduce((acc, s) => acc + s.duration, 0) / projectSessions.length;
  }

  getPeriods(timeRange) {
    const now = new Date();
    const periods = [];
    
    switch (timeRange) {
      case '7d':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          periods.push({
            label: date.toISOString().split('T')[0],
            start: new Date(date.toDateString()),
            end: new Date(date.getTime() + 24 * 60 * 60 * 1000)
          });
        }
        break;
      default:
        periods.push({
          label: 'current',
          start: this.getStartDate(timeRange),
          end: now
        });
    }
    
    return periods;
  }

  // Gerçek zamanlı metrikleri temizle (memory management)
  cleanup(olderThanDays = 30) {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    
    // Eski eventleri temizle
    this.events = this.events.filter(e => new Date(e.timestamp) >= cutoffDate);
    
    // Eski sessionları temizle
    Array.from(this.sessions.entries()).forEach(([sessionId, session]) => {
      if (new Date(session.startTime) < cutoffDate) {
        this.sessions.delete(sessionId);
      }
    });
    
    // Eski performance metriklerini temizle
    this.performanceMetrics.forEach((metrics, name) => {
      const filteredMetrics = metrics.filter(m => new Date(m.timestamp) >= cutoffDate);
      this.performanceMetrics.set(name, filteredMetrics);
    });

    console.log(`Analytics cleanup completed. Removed data older than ${olderThanDays} days.`);
  }
}

module.exports = new AnalyticsService();