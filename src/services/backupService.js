// App Lab Agent - Backup Service
// Proje ve veri yedekleme servisi

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { createReadStream, createWriteStream } = require('fs');
const { createGzip, createGunzip } = require('zlib');
const { pipeline } = require('stream/promises');
const EventEmitter = require('events');

class BackupService extends EventEmitter {
  constructor() {
    super();
    this.backups = new Map();
    this.backupPath = process.env.BACKUP_PATH || '/tmp/backups';
    this.schedules = new Map();
    this.compressionEnabled = true;
    this.encryptionEnabled = process.env.BACKUP_ENCRYPTION === 'true';
    this.encryptionKey = process.env.BACKUP_KEY || 'default-backup-key-change-this';
    this.maxBackups = parseInt(process.env.MAX_BACKUPS) || 50;
    
    this.ensureBackupDirectory();
    this.startScheduler();
  }

  // Backup dizinini oluştur
  async ensureBackupDirectory() {
    try {
      await fs.mkdir(this.backupPath, { recursive: true });
    } catch (error) {
      console.error('Backup directory oluşturulamadı:', error);
    }
  }

  // Proje backup'ı oluştur
  async createProjectBackup(projectId, options = {}) {
    try {
      const backupId = this.generateBackupId();
      const timestamp = new Date().toISOString();
      
      const backup = {
        id: backupId,
        type: 'project',
        projectId,
        userId: options.userId,
        name: options.name || `Project Backup ${timestamp}`,
        description: options.description || `Automated backup for project ${projectId}`,
        timestamp,
        status: 'creating',
        size: 0,
        compressed: this.compressionEnabled,
        encrypted: this.encryptionEnabled,
        filePath: null,
        checksum: null,
        metadata: {
          projectName: options.projectName,
          version: options.version,
          includeBuilds: options.includeBuilds || false,
          includeDeployments: options.includeDeployments || false,
          ...options.metadata
        }
      };

      this.backups.set(backupId, backup);
      this.emit('backup_started', backup);

      // Backup oluşturma işlemini başlat
      this.processBackupCreation(backupId);

      return {
        success: true,
        backup: {
          id: backup.id,
          name: backup.name,
          status: backup.status,
          timestamp: backup.timestamp
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Backup oluşturma işlemini işle
  async processBackupCreation(backupId) {
    const backup = this.backups.get(backupId);
    if (!backup) return;

    try {
      // Backup dosyası yolu
      const fileName = `${backupId}_${backup.type}_${Date.now()}.bak`;
      const filePath = path.join(this.backupPath, fileName);

      backup.filePath = filePath;

      // Backup verilerini topla
      const backupData = await this.collectBackupData(backup);

      // JSON formatına çevir
      const jsonData = JSON.stringify(backupData, null, 2);
      
      // Dosyaya yaz (sıkıştırma ve şifreleme ile)
      await this.writeBackupFile(filePath, jsonData, backup);

      // Dosya boyutunu hesapla
      const stats = await fs.stat(filePath);
      backup.size = stats.size;

      // Checksum hesapla
      backup.checksum = await this.calculateFileChecksum(filePath);

      backup.status = 'completed';
      backup.completedAt = new Date().toISOString();

      this.emit('backup_completed', backup);

      // Eski backup'ları temizle
      this.cleanupOldBackups();

    } catch (error) {
      backup.status = 'failed';
      backup.error = error.message;
      backup.failedAt = new Date().toISOString();

      this.emit('backup_failed', backup);
    }
  }

  // Backup verilerini topla
  async collectBackupData(backup) {
    const backupData = {
      metadata: {
        id: backup.id,
        type: backup.type,
        projectId: backup.projectId,
        timestamp: backup.timestamp,
        version: '1.0.0',
        source: 'AppLabAgent'
      },
      data: {}
    };

    // Memory store'dan veri topla (gerçek implementasyonda veritabanından gelir)
    const memoryStore = require('../data/memoryStore');

    if (backup.type === 'project' && backup.projectId) {
      // Proje verilerini topla
      backupData.data.project = memoryStore.getProject(backup.projectId);
      backupData.data.tasks = memoryStore.listTasks().filter(t => t.projectId === backup.projectId);
      
      if (backup.metadata.includeBuilds) {
        backupData.data.builds = memoryStore.listBuilds().filter(b => b.projectId === backup.projectId);
      }

      if (backup.metadata.includeDeployments) {
        backupData.data.deployments = memoryStore.listReleases().filter(r => r.projectId === backup.projectId);
      }
    }

    return backupData;
  }

  // Backup dosyasını yaz
  async writeBackupFile(filePath, data, backup) {
    let stream = createWriteStream(filePath);
    
    try {
      if (backup.compressed) {
        const gzip = createGzip();
        await pipeline(
          this.createStringStream(data),
          gzip,
          stream
        );
      } else {
        await fs.writeFile(filePath, data);
      }

      // Şifreleme (basit implementasyon - production'da daha güçlü olmalı)
      if (backup.encrypted) {
        await this.encryptFile(filePath);
      }

    } catch (error) {
      throw new Error(`Backup dosyası yazılamadı: ${error.message}`);
    }
  }

  // String'i stream'e çevir
  createStringStream(str) {
    const { Readable } = require('stream');
    return Readable.from([str]);
  }

  // Dosya şifreleme (basit)
  async encryptFile(filePath) {
    try {
      const data = await fs.readFile(filePath);
      const cipher = crypto.createCipher('aes192', this.encryptionKey);
      let encrypted = cipher.update(data);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      await fs.writeFile(filePath + '.enc', encrypted);
      await fs.unlink(filePath); // Orijinal dosyayı sil
      await fs.rename(filePath + '.enc', filePath); // Şifrelenmiş dosyayı rename et
    } catch (error) {
      throw new Error(`Dosya şifrelenemedi: ${error.message}`);
    }
  }

  // Dosya checksum'ı hesapla
  async calculateFileChecksum(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = createReadStream(filePath);

      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  // Backup'ı geri yükle
  async restoreBackup(backupId, options = {}) {
    try {
      const backup = this.backups.get(backupId);
      if (!backup) {
        return { success: false, error: 'Backup bulunamadı' };
      }

      if (backup.status !== 'completed') {
        return { success: false, error: 'Backup tamamlanmamış' };
      }

      const restoreId = this.generateRestoreId();
      const restore = {
        id: restoreId,
        backupId,
        status: 'restoring',
        startedAt: new Date().toISOString(),
        userId: options.userId
      };

      this.emit('restore_started', restore);

      // Restore işlemini başlat
      const result = await this.processBackupRestore(backup, restore, options);

      return {
        success: true,
        restore: {
          id: restoreId,
          status: restore.status,
          result
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Backup geri yükleme işlemini işle
  async processBackupRestore(backup, restore, options) {
    try {
      // Backup dosyasını oku
      const backupData = await this.readBackupFile(backup);

      // Verileri geri yükle
      const memoryStore = require('../data/memoryStore');

      if (backup.type === 'project') {
        // Proje verilerini geri yükle
        if (backupData.data.project) {
          // Yeni ID ile proje oluştur (conflict'i önlemek için)
          const newProjectId = options.newProjectId || this.generateProjectId();
          const projectData = {
            ...backupData.data.project,
            id: newProjectId,
            name: options.newProjectName || `${backupData.data.project.name} (Restored)`,
            restoredFrom: backup.id,
            restoredAt: new Date().toISOString()
          };

          memoryStore.createProject(projectData);

          // Task'ları geri yükle
          if (backupData.data.tasks) {
            backupData.data.tasks.forEach(task => {
              memoryStore.createTask({
                ...task,
                id: this.generateTaskId(),
                projectId: newProjectId
              });
            });
          }
        }
      }

      restore.status = 'completed';
      restore.completedAt = new Date().toISOString();

      this.emit('restore_completed', restore);

      return {
        projectId: backupData.data.project ? backupData.data.project.id : null,
        restoredItems: {
          projects: backupData.data.project ? 1 : 0,
          tasks: backupData.data.tasks ? backupData.data.tasks.length : 0,
          builds: backupData.data.builds ? backupData.data.builds.length : 0,
          deployments: backupData.data.deployments ? backupData.data.deployments.length : 0
        }
      };

    } catch (error) {
      restore.status = 'failed';
      restore.error = error.message;
      restore.failedAt = new Date().toISOString();

      this.emit('restore_failed', restore);
      throw error;
    }
  }

  // Backup dosyasını oku
  async readBackupFile(backup) {
    try {
      let data;

      if (backup.encrypted) {
        data = await this.decryptFile(backup.filePath);
      } else {
        data = await fs.readFile(backup.filePath);
      }

      if (backup.compressed) {
        // Decompress
        const gunzip = createGunzip();
        const decompressed = await pipeline(
          this.createBufferStream(data),
          gunzip
        );
        data = decompressed.toString();
      } else {
        data = data.toString();
      }

      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Backup dosyası okunamadı: ${error.message}`);
    }
  }

  // Dosya şifre çözme
  async decryptFile(filePath) {
    try {
      const encryptedData = await fs.readFile(filePath);
      const decipher = crypto.createDecipher('aes192', this.encryptionKey);
      let decrypted = decipher.update(encryptedData);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted;
    } catch (error) {
      throw new Error(`Dosya şifresi çözülemedi: ${error.message}`);
    }
  }

  // Buffer'ı stream'e çevir
  createBufferStream(buffer) {
    const { Readable } = require('stream');
    return Readable.from([buffer]);
  }

  // Backup'ları listele
  getBackups(options = {}) {
    let backups = Array.from(this.backups.values());

    // Filtrele
    if (options.userId) {
      backups = backups.filter(b => b.userId === options.userId);
    }
    if (options.projectId) {
      backups = backups.filter(b => b.projectId === options.projectId);
    }
    if (options.type) {
      backups = backups.filter(b => b.type === options.type);
    }
    if (options.status) {
      backups = backups.filter(b => b.status === options.status);
    }

    // Sırala
    backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit
    if (options.limit) {
      backups = backups.slice(0, options.limit);
    }

    return backups.map(backup => ({
      id: backup.id,
      name: backup.name,
      type: backup.type,
      projectId: backup.projectId,
      status: backup.status,
      size: backup.size,
      timestamp: backup.timestamp,
      completedAt: backup.completedAt,
      compressed: backup.compressed,
      encrypted: backup.encrypted
    }));
  }

  // Backup detaylarını getir
  getBackup(backupId) {
    const backup = this.backups.get(backupId);
    if (!backup) {
      return { success: false, error: 'Backup bulunamadı' };
    }

    return { success: true, backup };
  }

  // Backup sil
  async deleteBackup(backupId, userId = null) {
    try {
      const backup = this.backups.get(backupId);
      if (!backup) {
        return { success: false, error: 'Backup bulunamadı' };
      }

      // Kullanıcı kontrolü
      if (userId && backup.userId !== userId) {
        return { success: false, error: 'Bu backup\'ı silme yetkiniz yok' };
      }

      // Dosyayı sil
      if (backup.filePath) {
        await fs.unlink(backup.filePath);
      }

      // Backup kaydını sil
      this.backups.delete(backupId);

      this.emit('backup_deleted', backup);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Otomatik backup zamanla
  scheduleBackup(schedule) {
    const scheduleId = this.generateScheduleId();
    const scheduleData = {
      id: scheduleId,
      name: schedule.name,
      projectId: schedule.projectId,
      userId: schedule.userId,
      frequency: schedule.frequency, // 'daily', 'weekly', 'monthly'
      time: schedule.time || '02:00', // HH:MM format
      enabled: true,
      lastRun: null,
      nextRun: this.calculateNextRun(schedule.frequency, schedule.time),
      options: schedule.options || {}
    };

    this.schedules.set(scheduleId, scheduleData);
    this.emit('schedule_created', scheduleData);

    return {
      success: true,
      schedule: {
        id: scheduleId,
        name: scheduleData.name,
        frequency: scheduleData.frequency,
        nextRun: scheduleData.nextRun
      }
    };
  }

  // Sonraki çalışma zamanını hesapla
  calculateNextRun(frequency, time) {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const nextRun = new Date();

    nextRun.setHours(hours, minutes, 0, 0);

    switch (frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + (7 - nextRun.getDay()));
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 7);
        }
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1, 1);
        break;
    }

    return nextRun.toISOString();
  }

  // Scheduler başlat
  startScheduler() {
    // Her dakika zamanlanmış backup'ları kontrol et
    setInterval(() => {
      this.checkScheduledBackups();
    }, 60000); // 1 dakika
  }

  // Zamanlanmış backup'ları kontrol et
  checkScheduledBackups() {
    const now = new Date();

    this.schedules.forEach(schedule => {
      if (schedule.enabled && new Date(schedule.nextRun) <= now) {
        this.runScheduledBackup(schedule);
      }
    });
  }

  // Zamanlanmış backup'ı çalıştır
  async runScheduledBackup(schedule) {
    try {
      const backupName = `Scheduled: ${schedule.name} - ${new Date().toISOString()}`;
      
      await this.createProjectBackup(schedule.projectId, {
        name: backupName,
        description: `Automatic backup from schedule: ${schedule.name}`,
        userId: schedule.userId,
        ...schedule.options
      });

      // Sonraki çalışma zamanını güncelle
      schedule.lastRun = new Date().toISOString();
      schedule.nextRun = this.calculateNextRun(schedule.frequency, schedule.time);

      this.emit('scheduled_backup_completed', schedule);
    } catch (error) {
      this.emit('scheduled_backup_failed', { schedule, error: error.message });
    }
  }

  // Eski backup'ları temizle
  async cleanupOldBackups() {
    if (this.backups.size <= this.maxBackups) return;

    const sortedBackups = Array.from(this.backups.values())
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const backupsToDelete = sortedBackups.slice(0, this.backups.size - this.maxBackups);

    for (const backup of backupsToDelete) {
      await this.deleteBackup(backup.id);
    }

    console.log(`${backupsToDelete.length} eski backup temizlendi`);
  }

  // Backup istatistikleri
  getBackupStats(userId = null) {
    let backups = Array.from(this.backups.values());
    
    if (userId) {
      backups = backups.filter(b => b.userId === userId);
    }

    const totalSize = backups.reduce((acc, b) => acc + (b.size || 0), 0);
    const byStatus = backups.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
    const byType = backups.reduce((acc, b) => {
      acc[b.type] = (acc[b.type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalBackups: backups.length,
      totalSize,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      byStatus,
      byType,
      schedules: this.schedules.size,
      oldestBackup: backups.length ? 
        backups.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0].timestamp : null,
      newestBackup: backups.length ?
        backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0].timestamp : null
    };
  }

  // ID generators
  generateBackupId() {
    return `bkp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateRestoreId() {
    return `rst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateScheduleId() {
    return `sch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateProjectId() {
    return `prj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateTaskId() {
    return `tsk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new BackupService();