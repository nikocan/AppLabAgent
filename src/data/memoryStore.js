// App Lab Agent - Basit bellek içi durum deposu; entegrasyon bağlantıları, ajan görevleri,
// projeler ve otomasyon akışlarını tutar.

const memoryState = {
  connections: {},
  workflows: {},
  tasks: {},
  projects: {}
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

function reset() {
  memoryState.connections = {};
  memoryState.workflows = {};
  memoryState.tasks = {};
  memoryState.projects = {};
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
  reset
};
