// App Lab Agent - Ajan görevlerini n8n iş akışları ve dağıtım tetikleyicilerine kuyruklayan otomasyon yürütücüsü.

const {
  upsertTask,
  getBuild,
  upsertBuild,
  appendBuildHistory
} = require('../data/memoryStore');
const n8nConnector = require('../connectors/n8nConnector');
const hostingerConnector = require('../connectors/hostingerConnector');

const inMemoryQueue = [];

function enqueue(job) {
  inMemoryQueue.push({
    ...job,
    enqueuedAt: new Date().toISOString()
  });
}

function processNext() {
  if (!inMemoryQueue.length) {
    return null;
  }

  const job = inMemoryQueue.shift();

  if (job?.type === 'build') {
    const { buildId, payload } = job;
    const build = getBuild(buildId);
    if (!build) {
      return null;
    }

    appendBuildHistory(buildId, {
      status: 'building',
      notes: payload?.notes || 'Derleme süreci başladı'
    });
    upsertBuild(buildId, {
      status: 'building'
    });

    appendBuildHistory(buildId, {
      status: 'built',
      notes: payload?.completionNotes || 'Derleme başarıyla tamamlandı'
    });
    const artifactUrl =
      payload?.artifactUrl || `https://cdn.applabagent.net/artifacts/${buildId}.zip`;
    return upsertBuild(buildId, {
      status: 'built',
      artifactUrl
    });
  }

  const { taskId, definition, context } = job;

  const workflowId = definition?.workflowId;
  if (workflowId) {
    n8nConnector.triggerWorkflow(workflowId, context);
  }

  if (definition?.deploymentTarget) {
    hostingerConnector.triggerDeployment(definition.deploymentTarget);
  }

  const result = upsertTask(taskId, {
    ...definition,
    status: 'processed',
    lastRunAt: new Date().toISOString(),
    lastContext: context
  });

  return result;
}

function pendingJobs() {
  return [...inMemoryQueue];
}

function resetQueue() {
  inMemoryQueue.splice(0, inMemoryQueue.length);
}

module.exports = {
  enqueue,
  processNext,
  pendingJobs,
  resetQueue
};
