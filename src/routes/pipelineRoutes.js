// App Lab Agent - Pipeline planlama ve yürütme uç noktalarını yöneten HTTP yönlendirici modülü.

const pipelineService = require('../services/pipelineService');

function route({ method, pathname, body, query }) {
  if (method === 'POST' && pathname === '/api/pipeline/plan') {
    const result = pipelineService.planDelivery(body || {});
    return { status: 200, data: result };
  }

  if (method === 'POST' && pathname === '/api/pipeline/execute') {
    const result = pipelineService.executeDelivery(body || {});
    return { status: 200, data: result };
  }

  if (method === 'GET' && pathname === '/api/pipeline/runs') {
    return { status: 200, data: pipelineService.listPipelineRuns() };
  }

  if (method === 'GET' && pathname === '/api/pipeline/runs/detail') {
    const runId = query?.id;
    if (!runId) {
      return { status: 400, data: { error: 'Pipeline kimliği zorunludur.' } };
    }
    const result = pipelineService.getPipelineRunDetail(runId);
    return { status: 200, data: result };
  }

  return null;
}

module.exports = { route };
