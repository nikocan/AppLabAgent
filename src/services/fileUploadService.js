// App Lab Agent - File Upload Service
// Dosya yükleme ve yönetimi servisi

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');

class FileUploadService extends EventEmitter {
  constructor() {
    super();
    this.uploads = new Map();
    this.uploadPath = process.env.UPLOAD_PATH || '/tmp/uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/json',
      'application/zip',
      'application/x-zip-compressed'
    ];

    this.ensureUploadDirectory();
  }

  // Upload dizinini oluştur
  async ensureUploadDirectory() {
    try {
      await fs.mkdir(this.uploadPath, { recursive: true });
    } catch (error) {
      console.error('Upload directory oluşturulamadı:', error);
    }
  }

  // Dosya yükle
  async uploadFile(fileData, options = {}) {
    try {
      const validation = this.validateFile(fileData);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const fileId = this.generateFileId();
      const sanitizedFileName = this.sanitizeFileName(fileData.originalName);
      const fileExtension = path.extname(sanitizedFileName);
      const fileName = `${fileId}${fileExtension}`;
      const filePath = path.join(this.uploadPath, fileName);

      // Dosyayı kaydet
      await fs.writeFile(filePath, fileData.buffer);

      const uploadRecord = {
        id: fileId,
        originalName: fileData.originalName,
        fileName: fileName,
        filePath: filePath,
        mimeType: fileData.mimeType,
        size: fileData.size,
        checksum: this.calculateChecksum(fileData.buffer),
        userId: options.userId,
        projectId: options.projectId,
        category: options.category || 'general',
        uploadedAt: new Date().toISOString(),
        metadata: options.metadata || {},
        publicUrl: options.generatePublicUrl ? this.generatePublicUrl(fileName) : null
      };

      this.uploads.set(fileId, uploadRecord);
      this.emit('file_uploaded', uploadRecord);

      return {
        success: true,
        file: {
          id: fileId,
          originalName: uploadRecord.originalName,
          fileName: uploadRecord.fileName,
          size: uploadRecord.size,
          mimeType: uploadRecord.mimeType,
          publicUrl: uploadRecord.publicUrl,
          uploadedAt: uploadRecord.uploadedAt
        }
      };
    } catch (error) {
      this.emit('file_upload_error', { error: error.message, fileData });
      return { success: false, error: error.message };
    }
  }

  // Çoklu dosya yükleme
  async uploadMultipleFiles(filesData, options = {}) {
    const results = [];
    
    for (const fileData of filesData) {
      const result = await this.uploadFile(fileData, options);
      results.push(result);
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return {
      success: failed.length === 0,
      uploaded: successful.length,
      failed: failed.length,
      results: results
    };
  }

  // Dosya validasyonu
  validateFile(fileData) {
    // Boyut kontrolü
    if (fileData.size > this.maxFileSize) {
      return {
        valid: false,
        error: `Dosya boyutu çok büyük. Maksimum: ${this.maxFileSize / (1024 * 1024)}MB`
      };
    }

    // MIME type kontrolü
    if (!this.allowedMimeTypes.includes(fileData.mimeType)) {
      return {
        valid: false,
        error: `Desteklenmeyen dosya türü: ${fileData.mimeType}`
      };
    }

    // Dosya adı kontrolü
    if (!fileData.originalName || fileData.originalName.length > 255) {
      return {
        valid: false,
        error: 'Geçersiz dosya adı'
      };
    }

    return { valid: true };
  }

  // Dosya adını temizle
  sanitizeFileName(fileName) {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  // Dosya ID oluştur
  generateFileId() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Checksum hesapla
  calculateChecksum(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  // Public URL oluştur
  generatePublicUrl(fileName) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/api/files/${fileName}`;
  }

  // Dosya bilgilerini getir
  getFileInfo(fileId) {
    const file = this.uploads.get(fileId);
    if (!file) {
      return { success: false, error: 'Dosya bulunamadı' };
    }

    return {
      success: true,
      file: {
        id: file.id,
        originalName: file.originalName,
        fileName: file.fileName,
        size: file.size,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt,
        publicUrl: file.publicUrl,
        metadata: file.metadata
      }
    };
  }

  // Dosyayı indir
  async downloadFile(fileId) {
    const file = this.uploads.get(fileId);
    if (!file) {
      return { success: false, error: 'Dosya bulunamadı' };
    }

    try {
      const fileBuffer = await fs.readFile(file.filePath);
      return {
        success: true,
        buffer: fileBuffer,
        fileName: file.originalName,
        mimeType: file.mimeType
      };
    } catch (error) {
      return { success: false, error: 'Dosya okunamadı' };
    }
  }

  // Dosyayı sil
  async deleteFile(fileId, userId = null) {
    const file = this.uploads.get(fileId);
    if (!file) {
      return { success: false, error: 'Dosya bulunamadı' };
    }

    // Kullanıcı kontrolü (eğer userId verilmişse)
    if (userId && file.userId !== userId) {
      return { success: false, error: 'Bu dosyayı silme yetkiniz yok' };
    }

    try {
      // Fiziksel dosyayı sil
      await fs.unlink(file.filePath);
      
      // Upload kaydını sil
      this.uploads.delete(fileId);
      
      this.emit('file_deleted', file);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Dosya silinemedi' };
    }
  }

  // Kullanıcının dosyalarını listele
  getUserFiles(userId, options = {}) {
    const userFiles = Array.from(this.uploads.values())
      .filter(file => file.userId === userId)
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    if (options.category) {
      return userFiles.filter(file => file.category === options.category);
    }

    if (options.limit) {
      return userFiles.slice(0, options.limit);
    }

    return userFiles.map(file => ({
      id: file.id,
      originalName: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
      category: file.category,
      uploadedAt: file.uploadedAt,
      publicUrl: file.publicUrl
    }));
  }

  // Proje dosyalarını listele
  getProjectFiles(projectId, options = {}) {
    const projectFiles = Array.from(this.uploads.values())
      .filter(file => file.projectId === projectId)
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    return projectFiles.map(file => ({
      id: file.id,
      originalName: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
      userId: file.userId,
      uploadedAt: file.uploadedAt,
      publicUrl: file.publicUrl
    }));
  }

  // Dosya istatistikleri
  getFileStats(userId = null) {
    let files = Array.from(this.uploads.values());
    
    if (userId) {
      files = files.filter(file => file.userId === userId);
    }

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const byMimeType = files.reduce((acc, file) => {
      acc[file.mimeType] = (acc[file.mimeType] || 0) + 1;
      return acc;
    }, {});
    const byCategory = files.reduce((acc, file) => {
      acc[file.category] = (acc[file.category] || 0) + 1;
      return acc;
    }, {});

    return {
      totalFiles: files.length,
      totalSize,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      byMimeType,
      byCategory,
      oldestFile: files.length ? files.sort((a, b) => 
        new Date(a.uploadedAt) - new Date(b.uploadedAt))[0].uploadedAt : null,
      newestFile: files.length ? files.sort((a, b) => 
        new Date(b.uploadedAt) - new Date(a.uploadedAt))[0].uploadedAt : null
    };
  }

  // Resim için thumbnail oluştur (gelecekte implement edilebilir)
  async generateThumbnail(fileId, options = {}) {
    const file = this.uploads.get(fileId);
    if (!file) {
      return { success: false, error: 'Dosya bulunamadı' };
    }

    if (!file.mimeType.startsWith('image/')) {
      return { success: false, error: 'Sadece resim dosyaları için thumbnail oluşturulabilir' };
    }

    // Bu özellik sharp veya benzeri bir kütüphane ile implement edilebilir
    return { success: false, error: 'Thumbnail oluşturma henüz desteklenmiyor' };
  }

  // Dosya meta verilerini güncelle
  updateFileMetadata(fileId, metadata, userId = null) {
    const file = this.uploads.get(fileId);
    if (!file) {
      return { success: false, error: 'Dosya bulunamadı' };
    }

    // Kullanıcı kontrolü
    if (userId && file.userId !== userId) {
      return { success: false, error: 'Bu dosyayı düzenleme yetkiniz yok' };
    }

    file.metadata = { ...file.metadata, ...metadata };
    file.updatedAt = new Date().toISOString();

    this.emit('file_metadata_updated', file);
    return { success: true, file };
  }

  // Eski dosyaları temizle
  async cleanupOldFiles(olderThanDays = 30) {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const filesToDelete = Array.from(this.uploads.values())
      .filter(file => new Date(file.uploadedAt) < cutoffDate);

    let deletedCount = 0;
    for (const file of filesToDelete) {
      try {
        await fs.unlink(file.filePath);
        this.uploads.delete(file.id);
        deletedCount++;
      } catch (error) {
        console.error(`Dosya silinemedi: ${file.fileName}`, error);
      }
    }

    console.log(`${deletedCount} eski dosya temizlendi.`);
    return { success: true, deletedCount };
  }

  // Disk kullanımını kontrol et
  async getDiskUsage() {
    try {
      const stats = await fs.stat(this.uploadPath);
      const files = Array.from(this.uploads.values());
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);

      return {
        success: true,
        uploadPath: this.uploadPath,
        totalFiles: files.length,
        totalSize,
        totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
        maxFileSize: this.maxFileSize,
        maxFileSizeMB: Math.round(this.maxFileSize / (1024 * 1024) * 100) / 100
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new FileUploadService();