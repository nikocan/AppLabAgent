// App Lab Agent - Ajan görevlerini n8n iş akışları ve dağıtım tetikleyicilerine kuyruklayan otomasyon yürütücüsü.

const { upsertTask } = require('../data/memoryStore');
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

module.exports = {
  enqueue,
  processNext,
  pendingJobs
};
