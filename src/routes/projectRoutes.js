// App Lab Agent - Proje kayıtları, entegrasyon bağlantıları ve görev eşlemeleri için API yönlendiricisi.

const projectService = require('../services/projectService');

function route({ method, pathname, body }) {
  try {
    if (method === 'POST' && pathname === '/api/projects') {
      const { id, name, description } = body || {};
      const project = projectService.createProject(id, { name, description });
      return { status: 201, data: project };
    }

    if (method === 'GET' && pathname === '/api/projects') {
      return { status: 200, data: projectService.listProjectSummaries() };
    }

    const projectMatch = pathname.match(/^\/api\/projects\/([^/]+)$/);
    if (projectMatch && method === 'GET') {
      const projectId = projectMatch[1];
      const project = projectService.getProject(projectId);
      if (!project) {
        return { status: 404, data: { error: 'Proje bulunamadı.' } };
      }
      return { status: 200, data: project };
    }

    const integrationMatch = pathname.match(/^\/api\/projects\/([^/]+)\/integrations$/);
    if (integrationMatch && method === 'POST') {
      const projectId = integrationMatch[1];
      const { provider, details } = body || {};
      const project = projectService.linkIntegration(projectId, provider, details);
      return { status: 200, data: project };
    }

    const taskMatch = pathname.match(/^\/api\/projects\/([^/]+)\/tasks$/);
    if (taskMatch && method === 'POST') {
      const projectId = taskMatch[1];
      const { taskId, runPolicy } = body || {};
      const project = projectService.registerTaskMapping(projectId, taskId, { runPolicy });
      return { status: 200, data: project };
    }

    return null;
  } catch (error) {
    return { status: 500, data: { error: error.message || 'Sunucu hatası.' } };
  }
}

module.exports = { route };
