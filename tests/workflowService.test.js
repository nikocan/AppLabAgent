// App Lab Agent - İş akışı servisinin kayıt, görev bağlama ve tetikleme süreçlerini doğrulayan testler.

const test = require('node:test');
const assert = require('node:assert');

const store = require('../src/data/memoryStore');
const orchestrator = require('../src/services/agentOrchestrator');
const workflowService = require('../src/services/workflowService');
const automationRunner = require('../src/services/automationRunner');

test.beforeEach(() => {
  store.reset();
  automationRunner.resetQueue();
});

test('iş akışı kaydı ve listeleme', () => {
  const workflow = workflowService.registerWorkflow('wf-1', {
    name: 'Yayın hattı',
    description: 'Test ve dağıtım otomasyonu'
  });

  assert.strictEqual(workflow.id, 'wf-1');
  assert.strictEqual(workflow.name, 'Yayın hattı');

  const list = workflowService.listAllWorkflows();
  assert.strictEqual(list.length, 1);
});

test('iş akışına görev bağlama', () => {
  orchestrator.registerTask('lint', { workflowId: 'wf-2' });
  workflowService.registerWorkflow('wf-2');

  const result = workflowService.attachTask('wf-2', 'lint');

  assert.ok(result.tasks.includes('lint'));
});

test('iş akışı tetikleme kuyruğu', () => {
  workflowService.registerWorkflow('wf-queue', {
    definition: { deploymentTarget: 'app-lab' }
  });

  const response = workflowService.trigger('wf-queue', { branch: 'main' });

  assert.strictEqual(response.workflowId, 'wf-queue');
  assert.strictEqual(automationRunner.pendingJobs().length, 1);
  assert.strictEqual(automationRunner.pendingJobs()[0].definition.workflowId, 'wf-queue');
});
