// App Lab Agent - File Upload Routes
// Dosya yükleme API endpoints

const express = require('express');
const multer = require('multer');
const router = express.Router();
const fileUploadService = require('../services/fileUploadService');

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Tekli dosya yükleme
router.post('/single', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Dosya seçilmedi'
      });
    }

    const { userId, projectId, category } = req.body;

    const fileData = {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer
    };

    const options = {
      userId,
      projectId,
      category,
      generatePublicUrl: true,
      metadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString()
      }
    };

    const result = await fileUploadService.uploadFile(fileData, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Çoklu dosya yükleme
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Dosya seçilmedi'
      });
    }

    const { userId, projectId, category } = req.body;

    const filesData = req.files.map(file => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer
    }));

    const options = {
      userId,
      projectId,
      category,
      generatePublicUrl: true,
      metadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString()
      }
    };

    const result = await fileUploadService.uploadMultipleFiles(filesData, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Dosya bilgilerini getir
router.get('/:fileId/info', (req, res) => {
  try {
    const { fileId } = req.params;
    const result = fileUploadService.getFileInfo(fileId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Dosyayı indir
router.get('/:fileId/download', async (req, res) => {
  try {
    const { fileId } = req.params;
    const result = await fileUploadService.downloadFile(fileId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.send(result.buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Dosyayı sil
router.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userId } = req.body;

    const result = await fileUploadService.deleteFile(fileId, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Kullanıcının dosyalarını listele
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { category, limit } = req.query;

    const options = {
      category,
      limit: limit ? parseInt(limit) : undefined
    };

    const files = fileUploadService.getUserFiles(userId, options);
    
    res.json({
      success: true,
      files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Proje dosyalarını listele
router.get('/project/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const files = fileUploadService.getProjectFiles(projectId);
    
    res.json({
      success: true,
      files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Dosya istatistikleri
router.get('/stats/:userId?', (req, res) => {
  try {
    const { userId } = req.params;
    const stats = fileUploadService.getFileStats(userId);
    
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

// Dosya meta verilerini güncelle
router.put('/:fileId/metadata', (req, res) => {
  try {
    const { fileId } = req.params;
    const { metadata, userId } = req.body;

    if (!metadata) {
      return res.status(400).json({
        success: false,
        error: 'Metadata gerekli'
      });
    }

    const result = fileUploadService.updateFileMetadata(fileId, metadata, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Disk kullanımını kontrol et
router.get('/system/usage', async (req, res) => {
  try {
    const result = await fileUploadService.getDiskUsage();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Eski dosyaları temizle
router.post('/cleanup', async (req, res) => {
  try {
    const { olderThanDays = 30 } = req.body;
    const result = await fileUploadService.cleanupOldFiles(olderThanDays);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Dosya boyutu çok büyük'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Çok fazla dosya seçildi'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: error.message
  });
});

module.exports = router;