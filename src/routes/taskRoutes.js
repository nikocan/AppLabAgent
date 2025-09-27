// App Lab Agent - Ajan görevleri, kuyruk işlemleri ve otomasyon tetikleyicileri için API yönlendiricisi.

const orchestrator = require('../services/agentOrchestrator');
const automationRunner = require('../services/automationRunner');

function route({ method, pathname, body }) {
  try {
    if (method === 'POST' && pathname === '/api/tasks') {
      const { id, definition } = body || {};
      const task = orchestrator.registerTask(id, definition);
      return { status: 201, data: task };
    }

    if (method === 'GET' && pathname === '/api/tasks') {
      const tasks = orchestrator.listAllTasks();
      return { status: 200, data: tasks };
    }

    const dispatchMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/dispatch$/);
    if (dispatchMatch && method === 'POST') {
      const taskId = dispatchMatch[1];
      const { context } = body || {};
      const task = orchestrator.dispatchTask(taskId, context);
      return { status: 200, data: task };
    }

    const statusMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);
    if (statusMatch && method === 'GET') {
      const taskId = statusMatch[1];
      return { status: 200, data: orchestrator.getTaskStatus(taskId) };
    }

    if (method === 'POST' && pathname === '/api/queue/process') {
      const result = automationRunner.processNext();
      if (!result) {
        return { status: 204, data: null };
      }
      return { status: 200, data: result };
    }

    if (method === 'GET' && pathname === '/api/queue/pending') {
      return { status: 200, data: automationRunner.pendingJobs() };
    }

    return null;
  } catch (error) {
    return { status: 500, data: { error: error.message || 'Sunucu hatası.' } };
  }
}

module.exports = { route };
