// App Lab Agent - Proje yaşam döngüsünü, entegrasyon bağlarını ve görev eşleştirmelerini yöneten servis katmanı.

const {
  upsertProject,
  getProject,
  listProjects,
  getTask
} = require('../data/memoryStore');

function ensureProjectExists(projectId) {
  const project = getProject(projectId);
  if (!project) {
    throw new Error(`Proje bulunamadı: ${projectId}`);
  }
  return project;
}

function createProject(projectId, payload = {}) {
  if (!projectId) {
    throw new Error('Proje oluşturmak için kimlik gereklidir.');
  }

  const baseTimestamp = new Date().toISOString();

  return upsertProject(projectId, {
    id: projectId,
    name: payload.name || 'Yeni App Lab Projesi',
    description: payload.description || '',
    integrations: payload.integrations || {},
    tasks: payload.tasks || [],
    createdAt: baseTimestamp
  });
}

function linkIntegration(projectId, provider, details = {}) {
  if (!provider) {
    throw new Error('Proje entegrasyonu için sağlayıcı değeri zorunludur.');
  }

  const project = ensureProjectExists(projectId);

  const integrations = {
    ...project.integrations,
    [provider]: {
      ...details,
      linkedAt: new Date().toISOString()
    }
  };

  return upsertProject(projectId, {
    ...project,
    integrations
  });
}

function registerTaskMapping(projectId, taskId, options = {}) {
  if (!taskId) {
    throw new Error('Proje görev eşlemesi için görev kimliği gereklidir.');
  }

  const project = ensureProjectExists(projectId);
  const task = getTask(taskId);
  if (!task) {
    throw new Error(`Görev bulunamadı: ${taskId}`);
  }

  const tasks = project.tasks || [];
  const existingIndex = tasks.findIndex((item) => item.taskId === taskId);
  const mapping = {
    taskId,
    runPolicy: options.runPolicy || 'manual',
    lastRunAt: options.lastRunAt || null
  };

  if (existingIndex >= 0) {
    tasks.splice(existingIndex, 1, { ...tasks[existingIndex], ...mapping });
  } else {
    tasks.push(mapping);
  }

  return upsertProject(projectId, {
    ...project,
    tasks: [...tasks]
  });
}

function listProjectSummaries() {
  return Object.values(listProjects());
}

module.exports = {
  createProject,
  linkIntegration,
  registerTaskMapping,
  listProjectSummaries,
  getProject: ensureProjectExists
};
