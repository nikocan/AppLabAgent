// App Lab Agent - Basit bellek içi durum deposu; entegrasyon bağlantıları, ajan görevleri,
// projeler ve otomasyon akışlarını tutar.

const DEFAULT_DOMAIN = 'applabagent.net';

const memoryState = {
  connections: {},
  workflows: {},
  tasks: {},
  projects: {},
  builds: {},
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
  upsertBuild,
  getBuild,
  listBuilds,
  appendBuildHistory,
  getEnvironment,
  updateEnvironment,
  upsertReleaseChannel,
  reset
};
