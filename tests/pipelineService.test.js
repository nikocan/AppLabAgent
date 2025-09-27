// App Lab Agent - Pipeline servisinin uçtan uca davranışını doğrulayan test senaryoları.

const test = require('node:test');
const assert = require('node:assert');

const memoryStore = require('../src/data/memoryStore');
const automationRunner = require('../src/services/automationRunner');
const projectService = require('../src/services/projectService');
const environmentService = require('../src/services/environmentService');
const pipelineService = require('../src/services/pipelineService');
const githubConnector = require('../src/connectors/githubConnector');
const hostingerConnector = require('../src/connectors/hostingerConnector');
const n8nConnector = require('../src/connectors/n8nConnector');

function resetState() {
  memoryStore.reset();
  automationRunner.resetQueue();
}

test('entegrasyon bağlantıları olmadan pipeline planlanamaz', () => {
  resetState();
  projectService.createProject('pipeline-demo');

  assert.throws(
    () => pipelineService.planDelivery({ projectId: 'pipeline-demo' }),
    /Eksik entegrasyon bağlantıları/
  );
});

test('pipeline yürütmesi derlemeleri tamamlayıp sürümü terfi ettirir', () => {
  resetState();

  projectService.createProject('pipeline-demo', { name: 'Pipeline Demo Projesi' });
  environmentService.registerReleaseChannel('android', {
    packageName: 'com.applab.pipeline',
    track: 'internal'
  });
  environmentService.registerReleaseChannel('ios', {
    bundleId: 'com.applab.pipeline.ios',
    ascAppId: '123456789'
  });
  environmentService.registerReleaseChannel('web', {
    deploymentTarget: 'production'
  });

  githubConnector.connect('gh-token', { repo: 'applab-agent', organization: 'applab' });
  hostingerConnector.connect('hk-token', 'site-001', 'applabagent.net');
  n8nConnector.connect('https://n8n.applabagent.net', 'n8n-token');

  const plan = pipelineService.planDelivery({
    projectId: 'pipeline-demo',
    version: '1.5.0',
    platforms: ['android', 'web'],
    notes: 'QA öncesi pipeline planı'
  });

  assert.strictEqual(plan.status, 'planned');
  assert.strictEqual(plan.builds.length, 2);
  assert.ok(plan.steps.some((step) => step.type === 'planned'));

  const execution = pipelineService.executeDelivery({
    pipelineId: plan.pipelineId,
    autoDeploy: true,
    deploymentTarget: 'production',
    automationWorkflowId: 'ops-notify'
  });

  assert.strictEqual(execution.status, 'completed');
  assert.strictEqual(execution.builds.length, 2);
  execution.builds.forEach((build) => {
    assert.strictEqual(build.status, 'built');
    assert.ok(build.artifactUrl.includes(build.id));
  });

  assert.strictEqual(execution.release.status, 'in_review');
  assert.strictEqual(execution.releasePlatforms.length, 2);
  assert.ok(execution.deployment);
  assert.strictEqual(execution.deployment.status, 'deployment_requested');
  assert.ok(execution.automationTrigger);
  assert.strictEqual(execution.automationTrigger.status, 'workflow_triggered');
  assert.ok(execution.steps.some((step) => step.type === 'executed'));

  const runs = pipelineService.listPipelineRuns();
  assert.strictEqual(runs.length, 1);
  assert.strictEqual(runs[0].status, 'completed');
  assert.strictEqual(runs[0].lastExecution.releaseStatus, 'in_review');
});
