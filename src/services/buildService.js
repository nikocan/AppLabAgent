// App Lab Agent - Mobil ve web uygulamaları için derleme yaşam döngüsünü yöneten servis katmanı.

const {
  getProject,
  getWorkflow,
  upsertBuild,
  getBuild,
  listBuilds,
  appendBuildHistory
} = require('../data/memoryStore');
const automationRunner = require('./automationRunner');

function createBuild(payload) {
  const { projectId, platform, version, workflowId, releaseChannel } = payload;
  if (!projectId || !platform || !version) {
    throw new Error('projectId, platform ve version alanları zorunludur');
  }

  const project = getProject(projectId);
  if (!project) {
    throw new Error('Proje bulunamadı');
  }

  if (workflowId) {
    const workflow = getWorkflow(workflowId);
    if (!workflow) {
      throw new Error('İlgili iş akışı bulunamadı');
    }
  }

  const id = `build_${Date.now()}`;
  const build = upsertBuild(id, {
    projectId,
    platform,
    version,
    workflowId: workflowId || null,
    releaseChannel: releaseChannel || null,
    status: 'queued',
    artifactUrl: null,
    notes: payload?.notes || null
  });

  appendBuildHistory(id, {
    status: 'queued',
    notes: payload?.notes || 'Derleme kuyruğa alındı'
  });

  return build;
}

function triggerBuild(buildId, options = {}) {
  const build = getBuild(buildId);
  if (!build) {
    throw new Error('Derleme kaydı bulunamadı');
  }

  automationRunner.enqueue({
    type: 'build',
    buildId,
    payload: {
      notes: options?.notes,
      completionNotes: options?.completionNotes,
      artifactUrl: options?.artifactUrl
    }
  });

  return build;
}

function updateBuildStatus(buildId, updates) {
  const build = getBuild(buildId);
  if (!build) {
    throw new Error('Derleme kaydı bulunamadı');
  }

  if (updates?.status) {
    appendBuildHistory(buildId, {
      status: updates.status,
      notes: updates?.notes
    });
  }

  return upsertBuild(buildId, updates);
}

function listBuildsForQuery(query = {}) {
  const builds = Object.values(listBuilds());
  return builds.filter((build) => {
    if (query.projectId && build.projectId !== query.projectId) {
      return false;
    }
    if (query.platform && build.platform !== query.platform) {
      return false;
    }
    if (query.status && build.status !== query.status) {
      return false;
    }
    return true;
  });
}

function getBuildById(buildId) {
  const build = getBuild(buildId);
  if (!build) {
    throw new Error('Derleme kaydı bulunamadı');
  }
  return build;
}

module.exports = {
  createBuild,
  triggerBuild,
  updateBuildStatus,
  listBuildsForQuery,
  getBuildById
};
