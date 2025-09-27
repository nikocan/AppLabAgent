// App Lab Agent - Logging Service
// Sistem logları, hata takibi ve monitoring servisi

const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

class LoggingService extends EventEmitter {
  constructor() {
    super();
    this.logs = [];
    this.logFile = process.env.LOG_FILE || '/tmp/applab.log';
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.maxLogs = parseInt(process.env.MAX_LOGS) || 10000;
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    this.metrics = new Map();
    this.alerts = [];
    
    this.setupLogRotation();
  }

  // Log kaydı oluştur
  log(level, message, metadata = {}) {
    const levelNum = this.logLevels[level];
    const currentLevelNum = this.logLevels[this.logLevel];

    // Log level kontrolü
    if (levelNum > currentLevelNum) {
      return;
    }

    const logEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata: {
        ...metadata,
        pid: process.pid,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      },
      source: metadata.source || 'system'
    };

    this.logs.push(logEntry);
    this.emit('log_created', logEntry);

    // Console'a da yazdır
    this.printToConsole(logEntry);

    // Dosyaya yaz
    this.writeToFile(logEntry);

    // Memory limit kontrolü
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Error durumunda alert oluştur
    if (level === 'error') {
      this.createAlert(logEntry);
    }

    // Metrics güncelle
    this.updateMetrics(level, metadata);

    return logEntry.id;
  }

  // Farklı log seviyeleri için helper metodlar
  error(message, metadata = {}) {
    return this.log('error', message, metadata);
  }

  warn(message, metadata = {}) {
    return this.log('warn', message, metadata);
  }

  info(message, metadata = {}) {
    return this.log('info', message, metadata);
  }

  debug(message, metadata = {}) {
    return this.log('debug', message, metadata);
  }

  // Console'a yazdır
  printToConsole(logEntry) {
    const timestamp = new Date(logEntry.timestamp).toLocaleString();
    const levelColors = {
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      info: '\x1b[36m',    // Cyan
      debug: '\x1b[90m'    // Gray
    };
    
    const color = levelColors[logEntry.level] || '';
    const reset = '\x1b[0m';
    
    console.log(
      `${color}[${timestamp}] ${logEntry.level.toUpperCase()}: ${logEntry.message}${reset}`
    );

    if (Object.keys(logEntry.metadata).length > 0) {
      console.log(JSON.stringify(logEntry.metadata, null, 2));
    }
  }

  // Dosyaya yaz
  async writeToFile(logEntry) {
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(this.logFile, logLine);
    } catch (error) {
      console.error('Log dosyasına yazılamadı:', error);
    }
  }

  // Alert oluştur
  createAlert(logEntry) {
    const alert = {
      id: this.generateAlertId(),
      type: 'error',
      title: 'System Error',
      message: logEntry.message,
      source: logEntry.source,
      timestamp: logEntry.timestamp,
      metadata: logEntry.metadata,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    this.alerts.push(alert);
    this.emit('alert_created', alert);

    // Son 100 alert'i tut
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  // Metrics güncelle
  updateMetrics(level, metadata) {
    const today = new Date().toISOString().split('T')[0];
    
    if (!this.metrics.has(today)) {
      this.metrics.set(today, {
        error: 0,
        warn: 0,
        info: 0,
        debug: 0,
        sources: {},
        users: new Set(),
        projects: new Set()
      });
    }

    const dayMetrics = this.metrics.get(today);
    dayMetrics[level]++;

    if (metadata.source) {
      dayMetrics.sources[metadata.source] = (dayMetrics.sources[metadata.source] || 0) + 1;
    }

    if (metadata.userId) {
      dayMetrics.users.add(metadata.userId);
    }

    if (metadata.projectId) {
      dayMetrics.projects.add(metadata.projectId);
    }
  }

  // Logları getir
  getLogs(options = {}) {
    let filteredLogs = [...this.logs];

    // Level filtreleme
    if (options.level) {
      filteredLogs = filteredLogs.filter(log => log.level === options.level);
    }

    // Source filtreleme
    if (options.source) {
      filteredLogs = filteredLogs.filter(log => log.source === options.source);
    }

    // Tarih aralığı filtreleme
    if (options.startDate) {
      const startDate = new Date(options.startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
    }

    if (options.endDate) {
      const endDate = new Date(options.endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
    }

    // Anahtar kelime araması
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      filteredLogs = filteredLogs.filter(log =>
        log.message.toLowerCase().includes(searchTerm) ||
        JSON.stringify(log.metadata).toLowerCase().includes(searchTerm)
      );
    }

    // Sıralama
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit
    if (options.limit) {
      filteredLogs = filteredLogs.slice(0, options.limit);
    }

    return {
      success: true,
      logs: filteredLogs,
      total: filteredLogs.length
    };
  }

  // Belirli bir log'u getir
  getLog(logId) {
    const log = this.logs.find(l => l.id === logId);
    if (!log) {
      return { success: false, error: 'Log bulunamadı' };
    }

    return { success: true, log };
  }

  // Sistem metriklerini getir
  getMetrics(days = 7) {
    const metrics = {};
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      metrics[dateKey] = this.metrics.get(dateKey) || {
        error: 0,
        warn: 0,
        info: 0,
        debug: 0,
        sources: {},
        users: new Set(),
        projects: new Set()
      };

      // Set'leri array'e çevir
      metrics[dateKey].uniqueUsers = metrics[dateKey].users.size;
      metrics[dateKey].uniqueProjects = metrics[dateKey].projects.size;
      delete metrics[dateKey].users;
      delete metrics[dateKey].projects;
    }

    return {
      success: true,
      metrics,
      summary: this.getMetricsSummary(Object.values(metrics))
    };
  }

  // Metrics özeti
  getMetricsSummary(metricsArray) {
    const summary = {
      totalLogs: 0,
      errorCount: 0,
      warnCount: 0,
      infoCount: 0,
      debugCount: 0,
      topSources: {},
      errorRate: 0
    };

    metricsArray.forEach(dayMetric => {
      summary.totalLogs += dayMetric.error + dayMetric.warn + dayMetric.info + dayMetric.debug;
      summary.errorCount += dayMetric.error;
      summary.warnCount += dayMetric.warn;
      summary.infoCount += dayMetric.info;
      summary.debugCount += dayMetric.debug;

      Object.entries(dayMetric.sources).forEach(([source, count]) => {
        summary.topSources[source] = (summary.topSources[source] || 0) + count;
      });
    });

    summary.errorRate = summary.totalLogs > 0 ? 
      (summary.errorCount / summary.totalLogs * 100).toFixed(2) : 0;

    return summary;
  }

  // Alert'leri getir
  getAlerts(options = {}) {
    let filteredAlerts = [...this.alerts];

    if (options.status) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === options.status);
    }

    if (options.limit) {
      filteredAlerts = filteredAlerts.slice(0, options.limit);
    }

    filteredAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      success: true,
      alerts: filteredAlerts,
      total: filteredAlerts.length
    };
  }

  // Alert'i çöz
  resolveAlert(alertId, resolvedBy = null) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) {
      return { success: false, error: 'Alert bulunamadı' };
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = resolvedBy;

    this.emit('alert_resolved', alert);
    return { success: true, alert };
  }

  // Performance monitoring
  startPerformanceMonitoring(name, metadata = {}) {
    const monitorId = this.generateMonitorId();
    const monitor = {
      id: monitorId,
      name,
      startTime: process.hrtime.bigint(),
      metadata
    };

    return {
      id: monitorId,
      end: () => this.endPerformanceMonitoring(monitor)
    };
  }

  endPerformanceMonitoring(monitor) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - monitor.startTime) / 1000000; // Convert to milliseconds

    const performanceLog = {
      type: 'performance',
      name: monitor.name,
      duration,
      metadata: monitor.metadata
    };

    this.info(`Performance: ${monitor.name} completed in ${duration.toFixed(2)}ms`, performanceLog);

    return {
      name: monitor.name,
      duration,
      metadata: monitor.metadata
    };
  }

  // Request logging middleware
  createRequestLogger() {
    return (req, res, next) => {
      const startTime = Date.now();
      const monitor = this.startPerformanceMonitoring(`${req.method} ${req.path}`);

      // Response'u dinle
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const metadata = {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          userId: req.user?.id
        };

        const level = res.statusCode >= 400 ? 'error' : 'info';
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

        this.log(level, message, { source: 'http', ...metadata });
        monitor.end();
      });

      next();
    };
  }

  // Error handling middleware
  createErrorLogger() {
    return (err, req, res, next) => {
      const metadata = {
        method: req.method,
        url: req.originalUrl,
        error: err.message,
        stack: err.stack,
        userId: req.user?.id,
        source: 'error_handler'
      };

      this.error(`Unhandled error: ${err.message}`, metadata);
      next(err);
    };
  }

  // Log dosyasını temizle
  async clearLogs() {
    try {
      await fs.writeFile(this.logFile, '');
      this.logs = [];
      this.alerts = [];
      this.metrics.clear();
      
      this.info('Log dosyası temizlendi', { source: 'admin' });
      return { success: true };
    } catch (error) {
      this.error('Log dosyası temizlenirken hata oluştu', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  // Log dosyasını export et
  async exportLogs(options = {}) {
    try {
      const logs = this.getLogs(options);
      const exportData = {
        exportedAt: new Date().toISOString(),
        totalLogs: logs.logs.length,
        filters: options,
        logs: logs.logs
      };

      return {
        success: true,
        data: JSON.stringify(exportData, null, 2),
        filename: `logs_export_${Date.now()}.json`
      };
    } catch (error) {
      this.error('Log export hatası', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  // Log rotation setup
  setupLogRotation() {
    // Her gün gece yarısı log rotation
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.rotateLog();
      // Her 24 saatte bir tekrarla
      setInterval(() => this.rotateLog(), 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }

  // Log dosyasını rotate et
  async rotateLog() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      
      const archivedLogFile = this.logFile.replace('.log', `_${dateStr}.log`);
      
      // Mevcut log dosyasını arşivle
      await fs.copyFile(this.logFile, archivedLogFile);
      
      // Yeni log dosyası oluştur
      await fs.writeFile(this.logFile, '');
      
      this.info('Log dosyası rotate edildi', {
        archivedFile: archivedLogFile,
        source: 'log_rotation'
      });

      // 30 günden eski log dosyalarını sil
      this.cleanupOldLogs();
    } catch (error) {
      this.error('Log rotation hatası', { error: error.message });
    }
  }

  // Eski log dosyalarını temizle
  async cleanupOldLogs() {
    try {
      const logDir = path.dirname(this.logFile);
      const files = await fs.readdir(logDir);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      for (const file of files) {
        if (file.includes('applab_') && file.endsWith('.log')) {
          const fileDate = new Date(file.match(/\d{4}-\d{2}-\d{2}/)?.[0]);
          if (fileDate < cutoffDate) {
            await fs.unlink(path.join(logDir, file));
            this.info(`Eski log dosyası silindi: ${file}`, { source: 'cleanup' });
          }
        }
      }
    } catch (error) {
      this.error('Log cleanup hatası', { error: error.message });
    }
  }

  // ID generators
  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMonitorId() {
    return `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Sistem durumunu kontrol et
  healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      logFile: this.logFile,
      totalLogs: this.logs.length,
      logLevel: this.logLevel,
      alerts: {
        active: this.alerts.filter(a => a.status === 'active').length,
        resolved: this.alerts.filter(a => a.status === 'resolved').length
      },
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
  }
}

module.exports = new LoggingService();