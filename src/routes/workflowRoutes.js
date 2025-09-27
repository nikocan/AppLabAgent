// App Lab Agent - Otomasyon iş akışı uç noktalarını yöneten yönlendirici katmanı.

const workflowService = require('../services/workflowService');

function route({ method, pathname, body }) {
  if (method === 'GET' && pathname === '/api/workflows') {
    return {
      status: 200,
      data: workflowService.listAllWorkflows()
    };
  }

  if (method === 'POST' && pathname === '/api/workflows') {
    try {
      const workflow = workflowService.registerWorkflow(body?.id, body || {});
      return {
        status: 201,
        data: workflow
      };
    } catch (error) {
      return {
        status: 400,
        data: { error: error.message }
      };
    }
  }

  const attachMatch = pathname.match(/^\/api\/workflows\/([^/]+)\/attach-task$/);
  if (method === 'POST' && attachMatch) {
    try {
      const workflowId = attachMatch[1];
      const result = workflowService.attachTask(workflowId, body?.taskId);
      return {
        status: 200,
        data: result
      };
    } catch (error) {
      return {
        status: 400,
        data: { error: error.message }
      };
    }
  }

  const triggerMatch = pathname.match(/^\/api\/workflows\/([^/]+)\/trigger$/);
  if (method === 'POST' && triggerMatch) {
    try {
      const workflowId = triggerMatch[1];
      const result = workflowService.trigger(workflowId, body?.context || {});
      return {
        status: 202,
        data: result
      };
    } catch (error) {
      return {
        status: 400,
        data: { error: error.message }
      };
    }
  }

  return null;
}

module.exports = { route };
