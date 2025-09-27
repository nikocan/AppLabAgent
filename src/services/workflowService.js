// App Lab Agent - Otomasyon iş akışlarını yöneten, görev bağlantıları ve tetiklemeleri sağlayan servis katmanı.

const {
  upsertWorkflow,
  getWorkflow,
  listWorkflows,
  getTask
} = require('../data/memoryStore');
const automationRunner = require('./automationRunner');

function ensureWorkflowExists(workflowId) {
  const workflow = getWorkflow(workflowId);
  if (!workflow) {
    throw new Error(`İş akışı bulunamadı: ${workflowId}`);
  }
  return workflow;
}

function registerWorkflow(workflowId, payload = {}) {
  if (!workflowId) {
    throw new Error('İş akışı kaydı için kimlik gereklidir.');
  }

  return upsertWorkflow(workflowId, {
    id: workflowId,
    name: payload.name || 'Yeni Otomasyon',
    description: payload.description || '',
    definition: payload.definition || {},
    projectId: payload.projectId || null,
    tasks: payload.tasks || []
  });
}

function attachTask(workflowId, taskId) {
  if (!taskId) {
    throw new Error('İş akışına bağlanacak görev kimliği gereklidir.');
  }

  const workflow = ensureWorkflowExists(workflowId);
  const task = getTask(taskId);
  if (!task) {
    throw new Error(`Görev bulunamadı: ${taskId}`);
  }

  const tasks = workflow.tasks || [];
  if (!tasks.includes(taskId)) {
    tasks.push(taskId);
  }

  return upsertWorkflow(workflowId, {
    ...workflow,
    tasks
  });
}

function trigger(workflowId, context = {}) {
  const workflow = ensureWorkflowExists(workflowId);

  automationRunner.enqueue({
    taskId: `workflow:${workflowId}`,
    definition: {
      workflowId,
      deploymentTarget: workflow.definition?.deploymentTarget || null
    },
    context
  });

  return {
    workflowId,
    enqueuedAt: new Date().toISOString(),
    context
  };
}

function listAllWorkflows() {
  return Object.values(listWorkflows());
}

module.exports = {
  registerWorkflow,
  attachTask,
  trigger,
  listAllWorkflows,
  getWorkflow: ensureWorkflowExists
};
