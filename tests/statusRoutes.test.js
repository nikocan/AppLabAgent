// App Lab Agent - Durum yönlendiricisinin HTTP taleplerine verdiği yanıtları doğrulayan testler.

const test = require('node:test');
const assert = require('node:assert');

const store = require('../src/data/memoryStore');
const automationRunner = require('../src/services/automationRunner');
const statusRoutes = require('../src/routes/statusRoutes');
const projectService = require('../src/services/projectService');
const githubConnector = require('../src/connectors/githubConnector');
const hostingerConnector = require('../src/connectors/hostingerConnector');
const n8nConnector = require('../src/connectors/n8nConnector');
const pipelineService = require('../src/services/pipelineService');

test.beforeEach(() => {
  store.reset();
  automationRunner.resetQueue();
});

test('GET /api/status/summary varsayılan boş özet döndürür', async () => {
  const response = await statusRoutes.route({ method: 'GET', pathname: '/api/status/summary', query: {} });
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.data.projects.total, 0);
});

test('GET /api/status/recent-activity limit parametresini uygular', async () => {
  githubConnector.connect('gh-token', { repo: 'demo', organization: 'applab' });
  hostingerConnector.connect('host-token', 'site-001');
  n8nConnector.connect('https://n8n.local', 'n8n-token');

  const project = projectService.createProject('suite', { name: 'Suite' });
  const plan = pipelineService.planDelivery({ projectId: project.id, version: '2.0.0', platforms: ['android'] });
  pipelineService.executeDelivery({ pipelineId: plan.pipelineId, processQueue: true });

  const response = await statusRoutes.route({
    method: 'GET',
    pathname: '/api/status/recent-activity',
    query: { limit: '2' }
  });

  assert.strictEqual(response.status, 200);
  assert.ok(Array.isArray(response.data));
  assert.ok(response.data.length <= 2);
});
