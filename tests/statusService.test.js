// App Lab Agent - Durum servisinin platform özeti ve etkinlik listesi üretmesini doğrulayan testler.

const test = require('node:test');
const assert = require('node:assert');

const store = require('../src/data/memoryStore');
const automationRunner = require('../src/services/automationRunner');
const githubConnector = require('../src/connectors/githubConnector');
const hostingerConnector = require('../src/connectors/hostingerConnector');
const n8nConnector = require('../src/connectors/n8nConnector');
const projectService = require('../src/services/projectService');
const orchestrator = require('../src/services/agentOrchestrator');
const workflowService = require('../src/services/workflowService');
const agentService = require('../src/services/aiAgentService');
const pipelineService = require('../src/services/pipelineService');
const statusService = require('../src/services/statusService');

test.beforeEach(() => {
  store.reset();
  automationRunner.resetQueue();
});

test('Varsayılan platform özeti bağlantı durumlarını ve sıfır kayıtları döndürür', () => {
  const summary = statusService.buildPlatformSummary();

  assert.strictEqual(summary.environment.domain, 'applabagent.net');
  assert.deepStrictEqual(summary.connections.details.github.status, 'disconnected');
  assert.strictEqual(summary.projects.total, 0);
  assert.strictEqual(summary.builds.total, 0);
  assert.strictEqual(summary.recentActivity.length, 0);
});

test('Özet, kayıtlı projeler ve pipeline çalıştırmalarıyla güncellenir', () => {
  githubConnector.connect('gh-token', { repo: 'demo', organization: 'applab' });
  hostingerConnector.connect('host-token', 'site-001');
  n8nConnector.connect('https://n8n.local', 'n8n-token');

  const project = projectService.createProject('demo-app', { name: 'Demo App' });
  orchestrator.registerTask('prepare-build', { type: 'automation' });
  workflowService.registerWorkflow('wf-release', { projectId: project.id, tasks: ['prepare-build'] });
  agentService.registerAgentProfile({ id: 'ops-agent', name: 'Operations', provider: 'openai', projectId: project.id });

  const plan = pipelineService.planDelivery({
    projectId: project.id,
    version: '1.2.3',
    platforms: ['android', 'ios']
  });

  pipelineService.executeDelivery({ pipelineId: plan.pipelineId, processQueue: true });

  const summary = statusService.buildPlatformSummary();

  assert.strictEqual(summary.projects.total, 1);
  assert.strictEqual(summary.automations.workflows.total, 1);
  assert.strictEqual(summary.agents.total, 1);
  assert.ok(summary.builds.total >= 1);
  assert.strictEqual(summary.releases.total, 1);
  assert.strictEqual(summary.pipelines.total, 1);
  assert.ok(summary.pipelines.lastRunAt);
  assert.ok(summary.recentActivity.length > 0);
  assert.ok(summary.connections.connectedProviders.includes('github'));
  assert.ok(summary.connections.connectedProviders.includes('hostinger'));
  assert.ok(summary.connections.connectedProviders.includes('n8n'));
});

test('Son etkinlik listesi zaman damgasına göre sıralanır ve limit uygulanır', () => {
  githubConnector.connect('gh-token', { repo: 'demo', organization: 'applab' });
  hostingerConnector.connect('host-token', 'site-001');
  n8nConnector.connect('https://n8n.local', 'n8n-token');

  const project = projectService.createProject('mobile-suite', { name: 'Mobile Suite' });
  orchestrator.registerTask('mobile-build', { type: 'automation' });
  workflowService.registerWorkflow('wf-mobile', { projectId: project.id, tasks: ['mobile-build'] });

  const plan = pipelineService.planDelivery({ projectId: project.id, version: '3.0.0', platforms: ['android'] });
  pipelineService.executeDelivery({ pipelineId: plan.pipelineId, processQueue: true });

  const fullActivity = statusService.getRecentActivity();
  assert.ok(fullActivity.some((item) => item.type === 'pipeline'));

  const limited = statusService.getRecentActivity(3);
  assert.ok(limited.length <= 3);
  const timestamps = limited.map((item) => item.updatedAt);
  const sorted = [...timestamps].sort((a, b) => new Date(b) - new Date(a));
  assert.deepStrictEqual(timestamps, sorted);
});
