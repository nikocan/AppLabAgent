// App Lab Agent - Analytics Controller
// Analytics ve metrikleri yönetmek için controller

const analyticsService = require('../services/analyticsService');
const loggingService = require('../services/loggingService');

class AnalyticsController {
  // Event kaydet
  async trackEvent(req, res) {
    try {
      const userId = req.user?.id;
      const { name, category, properties, sessionId } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Event adı gereklidir'
        });
      }

      const result = analyticsService.trackEvent({
        name,
        category: category || 'general',
        userId,
        properties: properties || {},
        sessionId,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress
      });

      res.status(201).json(result);

    } catch (error) {
      loggingService.error('Track event error', { 
        error: error.message, 
        userId: req.user?.id 
      });
      res.status(500).json({
        success: false,
        error: 'Event kaydedilirken hata oluştu'
      });
    }
  }

  // Event listesi
  async getEvents(req, res) {
    try {
      const userId = req.user?.id;
      const { 
        startDate, 
        endDate, 
        category, 
        eventName,
        limit = 100,
        offset = 0
      } = req.query;

      const filters = {
        userId: req.user?.role === 'admin' ? undefined : userId,
        startDate,
        endDate,
        category,
        eventName,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const result = analyticsService.getEvents(filters);

      res.json(result);

    } catch (error) {
      loggingService.error('Get events error', { 
        error: error.message, 
        userId: req.user?.id 
      });
      res.status(500).json({
        success: false,
        error: 'Eventler alınırken hata oluştu'
      });
    }
  }

  // Kullanıcı metrikleri
  async getUserMetrics(req, res) {
    try {
      const userId = req.user.id;
      const { timeRange = '30d' } = req.query;

      const result = analyticsService.getUserMetrics(userId, timeRange);

      res.json(result);

    } catch (error) {
      loggingService.error('Get user metrics error', { 
        error: error.message, 
        userId: req.user.id 
      });
      res.status(500).json({
        success: false,
        error: 'Kullanıcı metrikleri alınırken hata oluştu'
      });
    }
  }

  // Proje metrikleri
  async getProjectMetrics(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;
      const { timeRange = '30d' } = req.query;

      const result = analyticsService.getProjectMetrics(projectId, userId, timeRange);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);

    } catch (error) {
      loggingService.error('Get project metrics error', { 
        error: error.message, 
        userId: req.user.id,
        projectId: req.params.projectId
      });
      res.status(500).json({
        success: false,
        error: 'Proje metrikleri alınırken hata oluştu'
      });
    }
  }

  // Platform istatistikleri (Admin only)
  async getPlatformStats(req, res) {
    try {
      const userId = req.user.id;
      
      // Admin kontrolü (basit kontrol - gerçek uygulamada daha güvenli olmalı)
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Bu işlem için yetkiniz yok'
        });
      }

      const { timeRange = '30d' } = req.query;

      const result = analyticsService.getPlatformStats(timeRange);

      res.json(result);

    } catch (error) {
      loggingService.error('Get platform stats error', { 
        error: error.message, 
        userId: req.user.id 
      });
      res.status(500).json({
        success: false,
        error: 'Platform istatistikleri alınırken hata oluştu'
      });
    }
  }

  // Performans metrikleri
  async getPerformanceMetrics(req, res) {
    try {
      const { 
        startDate, 
        endDate, 
        metricType,
        aggregation = 'avg'
      } = req.query;

      const result = analyticsService.getPerformanceMetrics({
        startDate,
        endDate,
        metricType,
        aggregation,
        userId: req.user?.role === 'admin' ? undefined : req.user.id
      });

      res.json(result);

    } catch (error) {
      loggingService.error('Get performance metrics error', { 
        error: error.message, 
        userId: req.user?.id 
      });
      res.status(500).json({
        success: false,
        error: 'Performans metrikleri alınırken hata oluştu'
      });
    }
  }

  // Kullanıcı aktivite özeti
  async getUserActivity(req, res) {
    try {
      const userId = req.user.id;
      const { timeRange = '7d' } = req.query;

      const result = analyticsService.getUserActivity(userId, timeRange);

      res.json(result);

    } catch (error) {
      loggingService.error('Get user activity error', { 
        error: error.message, 
        userId: req.user.id 
      });
      res.status(500).json({
        success: false,
        error: 'Kullanıcı aktivitesi alınırken hata oluştu'
      });
    }
  }

  // Conversion funnel
  async getConversionFunnel(req, res) {
    try {
      const { steps, timeRange = '30d' } = req.query;

      if (!steps) {
        return res.status(400).json({
          success: false,
          error: 'Funnel adımları gereklidir'
        });
      }

      const funnelSteps = Array.isArray(steps) ? steps : steps.split(',');

      const result = analyticsService.getConversionFunnel({
        steps: funnelSteps,
        timeRange,
        userId: req.user?.role === 'admin' ? undefined : req.user.id
      });

      res.json(result);

    } catch (error) {
      loggingService.error('Get conversion funnel error', { 
        error: error.message, 
        userId: req.user?.id 
      });
      res.status(500).json({
        success: false,
        error: 'Conversion funnel alınırken hata oluştu'
      });
    }
  }

  // Cohort analizi
  async getCohortAnalysis(req, res) {
    try {
      const { 
        cohortType = 'weekly',
        timeRange = '90d',
        eventName = 'user_login'
      } = req.query;

      const result = analyticsService.getCohortAnalysis({
        cohortType,
        timeRange,
        eventName,
        userId: req.user?.role === 'admin' ? undefined : req.user.id
      });

      res.json(result);

    } catch (error) {
      loggingService.error('Get cohort analysis error', { 
        error: error.message, 
        userId: req.user?.id 
      });
      res.status(500).json({
        success: false,
        error: 'Cohort analizi alınırken hata oluştu'
      });
    }
  }

  // Custom query
  async customQuery(req, res) {
    try {
      const { query, parameters } = req.body;
      const userId = req.user.id;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query gereklidir'
        });
      }

      // Güvenlik kontrolü - sadece SELECT sorgularına izin ver
      if (!query.trim().toLowerCase().startsWith('select')) {
        return res.status(400).json({
          success: false,
          error: 'Sadece SELECT sorguları desteklenir'
        });
      }

      const result = analyticsService.executeCustomQuery(query, parameters, userId);

      res.json(result);

    } catch (error) {
      loggingService.error('Custom query error', { 
        error: error.message, 
        userId: req.user.id 
      });
      res.status(500).json({
        success: false,
        error: 'Custom query çalıştırılırken hata oluştu'
      });
    }
  }

  // Dashboard verilerini al
  async getDashboardData(req, res) {
    try {
      const userId = req.user.id;
      const { timeRange = '30d' } = req.query;

      // Kullanıcı metrikleri
      const userMetrics = analyticsService.getUserMetrics(userId, timeRange);

      // Son aktiviteler
      const recentActivity = analyticsService.getUserActivity(userId, '7d');

      // Performans metrikleri
      const performanceMetrics = analyticsService.getPerformanceMetrics({
        timeRange,
        userId
      });

      const dashboardData = {
        success: true,
        data: {
          metrics: userMetrics.data,
          recentActivity: recentActivity.data,
          performance: performanceMetrics.data,
          generatedAt: new Date().toISOString()
        }
      };

      res.json(dashboardData);

    } catch (error) {
      loggingService.error('Get dashboard data error', { 
        error: error.message, 
        userId: req.user.id 
      });
      res.status(500).json({
        success: false,
        error: 'Dashboard verileri alınırken hata oluştu'
      });
    }
  }
}

module.exports = new AnalyticsController();