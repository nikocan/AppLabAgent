// App Lab Agent - Basit bellek içi durum deposu; entegrasyon bağlantıları, ajan görevleri,
// projeler ve otomasyon akışlarını tutar.

const DEFAULT_DOMAIN = 'applabagent.net';

const memoryState = {
  connections: {},
  workflows: {},
  tasks: {},
  projects: {},
  builds: {},
  releases: {},
  environment: {
    domain: DEFAULT_DOMAIN,
    releaseChannels: {},
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
};

function setConnection(provider, payload) {
  memoryState.connections[provider] = {
    ...payload,
    updatedAt: new Date().toISOString()
  };
  return memoryState.connections[provider];
}

function getConnection(provider) {
  return memoryState.connections[provider] || null;
}

function listConnections() {
  return memoryState.connections;
}

function upsertWorkflow(id, definition) {
  const existing = memoryState.workflows[id];
  const timestamp = new Date().toISOString();

  memoryState.workflows[id] = {
    id,
    name: definition?.name || existing?.name || 'Yeni Otomasyon',
    description: definition?.description || existing?.description || '',
    tasks: definition?.tasks || existing?.tasks || [],
    definition: definition?.definition || existing?.definition || {},
    projectId: definition?.projectId || existing?.projectId || null,
    createdAt: existing?.createdAt || definition?.createdAt || timestamp,
    updatedAt: timestamp
  };

  return memoryState.workflows[id];
}

function getWorkflow(id) {
  return memoryState.workflows[id] || null;
}

function listWorkflows() {
  return memoryState.workflows;
}

function upsertTask(id, task) {
  memoryState.tasks[id] = {
    ...task,
    updatedAt: new Date().toISOString()
  };
  return memoryState.tasks[id];
}

function getTask(id) {
  return memoryState.tasks[id] || null;
}

function listTasks() {
  return memoryState.tasks;
}

function upsertProject(id, project) {
  const existing = memoryState.projects[id];
  const timestamp = new Date().toISOString();

  memoryState.projects[id] = {
    id,
    createdAt: existing?.createdAt || project.createdAt || timestamp,
    ...project,
    updatedAt: timestamp
  };

  return memoryState.projects[id];
}

function getProject(id) {
  return memoryState.projects[id] || null;
}

function listProjects() {
  return memoryState.projects;
}

function upsertRelease(id, release) {
  const existing = memoryState.releases[id] || {};
  const timestamp = new Date().toISOString();

  const mergedPlatforms = { ...existing.platforms };
  if (release?.platforms) {
    Object.entries(release.platforms).forEach(([platform, configuration]) => {
      const current = mergedPlatforms[platform] || {};
      mergedPlatforms[platform] = {
        platform,
        status: configuration?.status || current.status || 'pending',
        buildId:
          Object.prototype.hasOwnProperty.call(configuration || {}, 'buildId')
            ? configuration.buildId
            : Object.prototype.hasOwnProperty.call(current, 'buildId')
              ? current.buildId
              : null,
        storeStatus: configuration?.storeStatus || current.storeStatus || 'not_submitted',
        storeId: configuration?.storeId || current.storeId || null,
        submissionNotes: configuration?.submissionNotes || current.submissionNotes || null,
        lastSubmissionAt: configuration?.lastSubmissionAt || current.lastSubmissionAt || null,
        metadata: {
          ...(current.metadata || {}),
          ...(configuration?.metadata || {})
        },
        createdAt: current.createdAt || configuration?.createdAt || timestamp,
        updatedAt: timestamp
      };
    });
  }

  memoryState.releases[id] = {
    id,
    projectId: release?.projectId ?? existing.projectId ?? null,
    version: release?.version || existing.version || '0.0.1',
    status: release?.status || existing.status || 'draft',
    notes: release?.notes ?? existing.notes ?? '',
    platforms: mergedPlatforms,
    history: release?.history || existing.history || [],
    createdAt: existing.createdAt || release?.createdAt || timestamp,
    updatedAt: timestamp
  };

  return memoryState.releases[id];
}

function getRelease(id) {
  return memoryState.releases[id] || null;
}

function listReleases() {
  return memoryState.releases;
}

function upsertReleasePlatform(id, platform, updates) {
  const release = memoryState.releases[id];
  if (!release) {
    return null;
  }

  const timestamp = new Date().toISOString();
  const existing = release.platforms?.[platform] || {};

  const merged = {
    platform,
    status: updates?.status || existing.status || 'pending',
    buildId:
      Object.prototype.hasOwnProperty.call(updates || {}, 'buildId')
        ? updates.buildId
        : Object.prototype.hasOwnProperty.call(existing, 'buildId')
          ? existing.buildId
          : null,
    storeStatus: updates?.storeStatus || existing.storeStatus || 'not_submitted',
    storeId: updates?.storeId || existing.storeId || null,
    submissionNotes: updates?.submissionNotes || existing.submissionNotes || null,
    lastSubmissionAt: updates?.lastSubmissionAt || existing.lastSubmissionAt || null,
    metadata: {
      ...(existing.metadata || {}),
      ...(updates?.metadata || {})
    },
    createdAt: existing.createdAt || timestamp,
    updatedAt: timestamp
  };

  release.platforms = {
    ...(release.platforms || {}),
    [platform]: merged
  };
  release.updatedAt = timestamp;

  return merged;
}

function appendReleaseHistory(id, entry) {
  const release = memoryState.releases[id];
  if (!release) {
    return null;
  }

  const record = {
    ...entry,
    timestamp: entry?.timestamp || new Date().toISOString()
  };

  release.history = [...(release.history || []), record];
  release.updatedAt = record.timestamp;

  return release;
}

function upsertBuild(id, build) {
  const existing = memoryState.builds[id] || {};
  const timestamp = new Date().toISOString();

  memoryState.builds[id] = {
    id,
    createdAt: existing?.createdAt || build?.createdAt || timestamp,
    history: existing?.history || build?.history || [],
    ...existing,
    ...build,
    updatedAt: timestamp
  };

  return memoryState.builds[id];
}

function getBuild(id) {
  return memoryState.builds[id] || null;
}

function listBuilds() {
  return memoryState.builds;
}

function appendBuildHistory(id, entry) {
  const build = memoryState.builds[id];
  if (!build) {
    return null;
  }

  const record = {
    ...entry,
    timestamp: entry?.timestamp || new Date().toISOString()
  };

  build.history = [...(build.history || []), record];
  build.updatedAt = record.timestamp;

  return build;
}

function getEnvironment() {
  return memoryState.environment;
}

function updateEnvironment(updates) {
  const timestamp = new Date().toISOString();
  memoryState.environment = {
    ...memoryState.environment,
    ...updates,
    updatedAt: timestamp
  };
  if (!memoryState.environment.createdAt) {
    memoryState.environment.createdAt = timestamp;
  }
  return memoryState.environment;
}

function upsertReleaseChannel(platform, configuration) {
  const timestamp = new Date().toISOString();
  const existing = memoryState.environment.releaseChannels[platform];

  memoryState.environment.releaseChannels[platform] = {
    platform,
    ...configuration,
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp
  };

  updateEnvironment({});

  return memoryState.environment.releaseChannels[platform];
}

function reset() {
  memoryState.connections = {};
  memoryState.workflows = {};
  memoryState.tasks = {};
  memoryState.projects = {};
  memoryState.builds = {};
  memoryState.releases = {};
  const timestamp = new Date().toISOString();
  memoryState.environment = {
    domain: DEFAULT_DOMAIN,
    releaseChannels: {},
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

module.exports = {
  setConnection,
  getConnection,
  listConnections,
  upsertWorkflow,
  getWorkflow,
  listWorkflows,
  upsertTask,
  getTask,
  listTasks,
  upsertProject,
  getProject,
  listProjects,
  upsertRelease,
  getRelease,
  listReleases,
  upsertReleasePlatform,
  appendReleaseHistory,
  upsertBuild,
  getBuild,
  listBuilds,
  appendBuildHistory,
  getEnvironment,
  updateEnvironment,
  upsertReleaseChannel,
  reset
};
