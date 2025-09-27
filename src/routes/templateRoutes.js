// App Lab Agent - Template Routes
// Şablon yönetimi API endpoints

const express = require('express');
const router = express.Router();
const templateService = require('../services/templateService');

// Şablonları listele
router.get('/', (req, res) => {
  try {
    const { category, framework, language, platform, tags, sortBy, limit } = req.query;

    const filters = {
      category,
      framework,
      language,
      platform,
      tags: tags ? tags.split(',') : undefined,
      sortBy,
      limit: limit ? parseInt(limit) : undefined
    };

    const templates = templateService.getTemplates(filters);
    
    res.json({
      success: true,
      templates,
      total: templates.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Şablon detaylarını getir
router.get('/:templateId', (req, res) => {
  try {
    const { templateId } = req.params;
    const result = templateService.getTemplate(templateId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Şablondan proje oluştur
router.post('/:templateId/create-project', async (req, res) => {
  try {
    const { templateId } = req.params;
    const { projectName, userId, description } = req.body;

    if (!projectName || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Proje adı ve kullanıcı ID gerekli'
      });
    }

    const projectData = {
      projectName,
      userId,
      description
    };

    const result = await templateService.createProjectFromTemplate(templateId, projectData);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Kullanıcı şablonu oluştur
router.post('/create', (req, res) => {
  try {
    const {
      name,
      description,
      category,
      type,
      platform,
      framework,
      language,
      version,
      tags,
      structure,
      dependencies,
      devDependencies,
      isPublic,
      userId
    } = req.body;

    if (!name || !description || !userId || !structure) {
      return res.status(400).json({
        success: false,
        error: 'Şablon adı, açıklama, kullanıcı ID ve yapı gerekli'
      });
    }

    const templateData = {
      name,
      description,
      category,
      type,
      platform,
      framework,
      language,
      version,
      tags,
      structure,
      dependencies,
      devDependencies,
      isPublic
    };

    const result = templateService.createUserTemplate(templateData, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Kullanıcının şablonlarını getir
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const result = templateService.getUserTemplates(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Şablon güncelle
router.put('/:templateId', (req, res) => {
  try {
    const { templateId } = req.params;
    const { userId, ...updates } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Kullanıcı ID gerekli'
      });
    }

    const result = templateService.updateTemplate(templateId, updates, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Şablon sil
router.delete('/:templateId', (req, res) => {
  try {
    const { templateId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Kullanıcı ID gerekli'
      });
    }

    const result = templateService.deleteTemplate(templateId, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Kategorileri getir
router.get('/meta/categories', (req, res) => {
  try {
    const categories = templateService.getCategories();
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Popüler şablonları getir
router.get('/featured/popular', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const result = templateService.getPopularTemplates(parseInt(limit));
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Şablon arama
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const { category, framework, language, platform, tags, sortBy, limit } = req.query;

    const filters = {
      category,
      framework,
      language,
      platform,
      tags: tags ? tags.split(',') : undefined,
      sortBy,
      limit: limit ? parseInt(limit) : undefined
    };

    const templates = templateService.searchTemplates(query, filters);
    
    res.json({
      success: true,
      templates,
      total: templates.length,
      query
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Template istatistikleri
router.get('/meta/stats', (req, res) => {
  try {
    const stats = templateService.getTemplateStats();
    
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

// Framework listesi
router.get('/meta/frameworks', (req, res) => {
  try {
    const frameworks = {
      web: [
        { id: 'react', name: 'React', language: 'javascript' },
        { id: 'vue', name: 'Vue.js', language: 'javascript' },
        { id: 'angular', name: 'Angular', language: 'typescript' },
        { id: 'svelte', name: 'Svelte', language: 'javascript' },
        { id: 'nextjs', name: 'Next.js', language: 'javascript' }
      ],
      mobile: [
        { id: 'react-native', name: 'React Native', language: 'javascript' },
        { id: 'flutter', name: 'Flutter', language: 'dart' },
        { id: 'ionic', name: 'Ionic', language: 'javascript' },
        { id: 'xamarin', name: 'Xamarin', language: 'csharp' }
      ],
      backend: [
        { id: 'express', name: 'Express.js', language: 'javascript' },
        { id: 'fastapi', name: 'FastAPI', language: 'python' },
        { id: 'django', name: 'Django', language: 'python' },
        { id: 'spring', name: 'Spring Boot', language: 'java' },
        { id: 'dotnet', name: '.NET Core', language: 'csharp' }
      ]
    };

    res.json({
      success: true,
      frameworks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Şablon yapısını önizle
router.get('/:templateId/preview', (req, res) => {
  try {
    const { templateId } = req.params;
    const templateResult = templateService.getTemplate(templateId);
    
    if (!templateResult.success) {
      return res.status(404).json(templateResult);
    }

    const template = templateResult.template;
    
    // Yapıyı basitleştir (sadece dosya/klasör isimleri)
    const simplifyStructure = (structure) => {
      const simplified = {};
      
      Object.keys(structure).forEach(key => {
        if (structure[key].type === 'directory') {
          simplified[key] = {
            type: 'directory',
            children: simplifyStructure(structure[key].children)
          };
        } else {
          simplified[key] = {
            type: 'file',
            size: structure[key].content ? structure[key].content.length : 0
          };
        }
      });
      
      return simplified;
    };

    const preview = {
      id: template.id,
      name: template.name,
      description: template.description,
      framework: template.framework,
      language: template.language,
      structure: simplifyStructure(template.structure),
      dependencies: template.dependencies,
      devDependencies: template.devDependencies,
      fileCount: this.countFiles(template.structure)
    };

    res.json({
      success: true,
      preview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Yardımcı fonksiyon: dosya sayısını hesapla
function countFiles(structure) {
  let count = 0;
  
  Object.values(structure).forEach(item => {
    if (item.type === 'file') {
      count++;
    } else if (item.type === 'directory' && item.children) {
      count += countFiles(item.children);
    }
  });
  
  return count;
}

module.exports = router;