// App Lab Agent - Mobile App Routes
// Mobil uygulama yönetimi API endpoints

const express = require('express');
const router = express.Router();
const mobileAppService = require('../services/mobileAppService');

// Yeni mobil app oluştur
router.post('/create', async (req, res) => {
  try {
    const {
      name,
      platform,
      projectId,
      userId,
      packageName,
      bundleId,
      version,
      buildNumber,
      devConfig,
      stagingConfig,
      prodConfig,
      iosCertificates,
      androidCertificates,
      metadata
    } = req.body;

    if (!name || !platform || !projectId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Uygulama adı, platform, proje ID ve kullanıcı ID gerekli'
      });
    }

    const appData = {
      name,
      platform,
      projectId,
      userId,
      packageName,
      bundleId,
      version,
      buildNumber,
      devConfig,
      stagingConfig,
      prodConfig,
      iosCertificates,
      androidCertificates,
      metadata
    };

    const result = await mobileAppService.createMobileApp(appData);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mobil app build başlat
router.post('/:appId/build', async (req, res) => {
  try {
    const { appId } = req.params;
    const { environment, version, buildNumber, customConfig } = req.body;

    const buildOptions = {
      environment,
      version,
      buildNumber,
      customConfig
    };

    const result = await mobileAppService.buildMobileApp(appId, buildOptions);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// App deployment başlat
router.post('/:appId/deploy', async (req, res) => {
  try {
    const { appId } = req.params;
    const { environment, target } = req.body;

    const deploymentOptions = {
      environment,
      target // 'internal', 'testflight', 'playstore', 'appstore'
    };

    const result = await mobileAppService.deployMobileApp(appId, deploymentOptions);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mobil app bilgilerini getir
router.get('/:appId', (req, res) => {
  try {
    const { appId } = req.params;
    const result = mobileAppService.getMobileApp(appId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Build bilgilerini getir
router.get('/build/:buildId', (req, res) => {
  try {
    const { buildId } = req.params;
    const result = mobileAppService.getMobileBuild(buildId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Build loglarını getir
router.get('/build/:buildId/logs', (req, res) => {
  try {
    const { buildId } = req.params;
    const result = mobileAppService.getBuildLogs(buildId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// App build geçmişini getir
router.get('/:appId/builds', (req, res) => {
  try {
    const { appId } = req.params;
    const result = mobileAppService.getAppBuilds(appId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// App deployment geçmişini getir
router.get('/:appId/deployments', (req, res) => {
  try {
    const { appId } = req.params;
    const result = mobileAppService.getAppDeployments(appId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Kullanıcının mobil applerini listele
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const result = mobileAppService.getUserMobileApps(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Proje mobil applerini listele
router.get('/project/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const result = mobileAppService.getProjectMobileApps(projectId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mobil app sil
router.delete('/:appId', (req, res) => {
  try {
    const { appId } = req.params;
    const { userId } = req.body;

    const result = mobileAppService.deleteMobileApp(appId, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mobile service istatistikleri
router.get('/stats/:userId?', (req, res) => {
  try {
    const { userId } = req.params;
    const stats = mobileAppService.getMobileStats(userId);
    
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

// Build artifact indir
router.get('/build/:buildId/download/:artifactType', async (req, res) => {
  try {
    const { buildId, artifactType } = req.params;
    
    const buildResult = mobileAppService.getMobileBuild(buildId);
    if (!buildResult.success) {
      return res.status(404).json(buildResult);
    }

    const build = buildResult.build;
    const artifact = build.artifacts?.find(a => a.type === artifactType);
    
    if (!artifact) {
      return res.status(404).json({
        success: false,
        error: 'Artifact bulunamadı'
      });
    }

    // Gerçek implementasyonda dosya stream edilecek
    res.json({
      success: true,
      message: 'Download başlatılacak',
      artifact: {
        filename: artifact.filename,
        size: artifact.size,
        downloadUrl: artifact.downloadUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// QR kod ile uygulama yükleme sayfası
router.get('/install/:deploymentId', (req, res) => {
  try {
    const { deploymentId } = req.params;
    
    // Deployment bilgilerini al
    // Gerçek implementasyonda HTML sayfası döndürülecek
    res.json({
      success: true,
      message: 'Uygulama yükleme sayfası',
      deploymentId,
      installationInstructions: {
        ios: 'Bu link ile uygulamayı iOS cihazınıza yükleyebilirsiniz',
        android: 'APK dosyasını indirip yükleyin'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Platform özellikleri
router.get('/platforms/features', (req, res) => {
  try {
    const platformFeatures = {
      ios: {
        name: 'iOS',
        extensions: ['.ipa'],
        certificates: ['development', 'distribution'],
        targets: ['internal', 'testflight', 'appstore'],
        buildTime: '5-15 minutes'
      },
      android: {
        name: 'Android',
        extensions: ['.apk', '.aab'],
        certificates: ['debug', 'release'],
        targets: ['internal', 'playstore'],
        buildTime: '3-10 minutes'
      },
      'react-native': {
        name: 'React Native',
        platforms: ['ios', 'android'],
        buildTargets: ['debug', 'release'],
        features: ['hot-reload', 'fast-refresh']
      },
      flutter: {
        name: 'Flutter',
        platforms: ['ios', 'android', 'web'],
        buildTargets: ['debug', 'profile', 'release'],
        features: ['hot-reload', 'hot-restart']
      }
    };

    res.json({
      success: true,
      platforms: platformFeatures
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;