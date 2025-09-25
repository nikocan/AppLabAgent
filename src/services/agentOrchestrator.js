// App Lab Agent - Yapay zeka ajan görevlerini planlayan ve otomasyon motoruna ileten orkestrasyon hizmeti.

const { upsertTask, getTask, listTasks } = require('../data/memoryStore');
const automationRunner = require('./automationRunner');

function registerTask(taskId, definition) {
  if (!taskId) {
    throw new Error('Ajan görevi kaydı için kimlik gereklidir.');
  }

  const task = upsertTask(taskId, {
    status: 'registered',
    definition
  });

  return task;
}

function dispatchTask(taskId, context = {}) {
  const task = getTask(taskId);
  if (!task) {
    throw new Error(`Görev bulunamadı: ${taskId}`);
  }

  const scheduled = upsertTask(taskId, {
    ...task,
    status: 'queued',
    lastContext: context
  });

  automationRunner.enqueue({
    taskId,
    definition: scheduled.definition,
    context
  });

  return scheduled;
}

function getTaskStatus(taskId) {
  return getTask(taskId);
}

function listAllTasks() {
  return listTasks();
}

module.exports = {
  registerTask,
  dispatchTask,
  getTaskStatus,
  listAllTasks
};
