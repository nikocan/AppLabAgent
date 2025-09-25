// App Lab Agent - Orkestrasyon servisinin bağlantı ve kuyruk işleyişini doğrulayan temel testler.

const test = require('node:test');
const assert = require('node:assert');

const store = require('../src/data/memoryStore');
const githubConnector = require('../src/connectors/githubConnector');
const n8nConnector = require('../src/connectors/n8nConnector');
const hostingerConnector = require('../src/connectors/hostingerConnector');
const orchestrator = require('../src/services/agentOrchestrator');
const automationRunner = require('../src/services/automationRunner');

test.beforeEach(() => {
  store.reset();
  automationRunner.resetQueue();
});

test('GitHub entegrasyon bağlantısı durumu', () => {
  githubConnector.connect('fake-token', { repo: 'app', organization: 'lab' });
  const status = githubConnector.getStatus();
  assert.strictEqual(status.status, 'connected');
  assert.strictEqual(status.metadata.repo, 'app');
});

test('n8n ve Hostinger entegrasyonları kurulmadan görev çalıştırılamaz', () => {
  assert.throws(() => {
    n8nConnector.triggerWorkflow('wf-1', {});
  }, /bağlantı kurulmalıdır/);

  assert.throws(() => {
    hostingerConnector.triggerDeployment('production');
  }, /bağlantı kurulmalıdır/);
});

test('Ajan görevi kaydı, dispatch ve kuyruk işleme', () => {
  n8nConnector.connect('https://n8n.local', 'apikey');
  hostingerConnector.connect('hostinger-key', 'site-123');

  const definition = {
    workflowId: 'wf-123',
    deploymentTarget: 'staging'
  };

  orchestrator.registerTask('build-release', definition);
  orchestrator.dispatchTask('build-release', { branch: 'main' });

  const pending = automationRunner.pendingJobs();
  assert.strictEqual(pending.length, 1);

  const processed = automationRunner.processNext();
  assert.strictEqual(processed.status, 'processed');
  assert.strictEqual(processed.deploymentTarget, 'staging');
});
