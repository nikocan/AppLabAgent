// App Lab Agent - Çoklu platform sürüm yönetimi servis katmanı; yayın süreçlerini, platform durumlarını ve geçmiş kayıtlarını yönetir.

const {
  upsertRelease,
  getRelease,
  listReleases,
  upsertReleasePlatform,
  appendReleaseHistory,
  getProject,
  getBuild
} = require('../data/memoryStore');

function ensureReleaseExists(releaseId) {
  const release = getRelease(releaseId);
  if (!release) {
    throw new Error(`Sürüm kaydı bulunamadı: ${releaseId}`);
  }
  return release;
}

function createRelease({ id, projectId, version, platforms = [], notes } = {}) {
  if (projectId) {
    const project = getProject(projectId);
    if (!project) {
      throw new Error(`Sürüm için belirtilen proje bulunamadı: ${projectId}`);
    }
  }

  const releaseId = id || `rel-${Date.now()}`;

  const base = upsertRelease(releaseId, {
    projectId: projectId || null,
    version: version || '0.0.1',
    status: 'draft',
    notes: notes || '',
    history: []
  });

  const normalizedPlatforms = Array.isArray(platforms)
    ? platforms
    : typeof platforms === 'object' && platforms !== null
      ? Object.keys(platforms)
      : [];

  normalizedPlatforms.forEach((platform) => {
    upsertReleasePlatform(releaseId, platform, {
      status: 'pending',
      storeStatus: 'not_submitted'
    });
  });

  appendReleaseHistory(releaseId, {
    type: 'created',
    message: `${base.version} sürümü oluşturuldu`,
    actor: 'system'
  });

  return getRelease(releaseId);
}

function listReleaseSummaries({ projectId } = {}) {
  const releases = Object.values(listReleases() || {});

  return releases
    .filter((release) => {
      if (!projectId) {
        return true;
      }
      return release.projectId === projectId;
    })
    .map((release) => ({
      id: release.id,
      projectId: release.projectId,
      version: release.version,
      status: release.status,
      platforms: release.platforms,
      updatedAt: release.updatedAt
    }));
}

function getReleaseDetail(releaseId) {
  return ensureReleaseExists(releaseId);
}

function assignPlatformBuild(releaseId, platform, buildId, actor = 'system') {
  ensureReleaseExists(releaseId);
  if (!platform) {
    throw new Error('Platform belirtilmelidir.');
  }

  const build = getBuild(buildId);
  if (!build) {
    throw new Error(`Bağlanacak build bulunamadı: ${buildId}`);
  }

  const platformState = upsertReleasePlatform(releaseId, platform, {
    buildId,
    status: 'in_progress',
    storeStatus: 'not_submitted'
  });

  appendReleaseHistory(releaseId, {
    type: 'build_assigned',
    platform,
    message: `${platform} platformu için ${buildId} build'i ilişkilendirildi`,
    actor
  });

  return platformState;
}

function updatePlatformStatus(releaseId, platform, updates = {}, actor = 'system') {
  ensureReleaseExists(releaseId);
  if (!platform) {
    throw new Error('Platform belirtilmelidir.');
  }

  const platformState = upsertReleasePlatform(releaseId, platform, updates);
  appendReleaseHistory(releaseId, {
    type: 'platform_update',
    platform,
    message: updates?.message || `${platform} platform durumu güncellendi`,
    actor,
    details: {
      status: platformState.status,
      storeStatus: platformState.storeStatus
    }
  });

  return platformState;
}

function promoteRelease(releaseId, status, actor = 'system', message) {
  const release = ensureReleaseExists(releaseId);
  if (!status) {
    throw new Error('Yeni sürüm durumunu belirtmelisiniz.');
  }

  const updated = upsertRelease(releaseId, {
    status
  });

  appendReleaseHistory(releaseId, {
    type: 'status_change',
    message: message || `${release.version} sürüm durumu ${status} olarak güncellendi`,
    actor,
    details: { previous: release.status, current: status }
  });

  return updated;
}

function recordMilestone(releaseId, entry) {
  ensureReleaseExists(releaseId);
  appendReleaseHistory(releaseId, {
    type: 'milestone',
    ...entry
  });
  return getRelease(releaseId);
}

module.exports = {
  createRelease,
  listReleaseSummaries,
  getReleaseDetail,
  assignPlatformBuild,
  updatePlatformStatus,
  promoteRelease,
  recordMilestone
};
