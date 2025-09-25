// App Lab Agent - Proje servisinin temel yaşam döngüsü senaryolarını doğrulayan testler.

const test = require('node:test');
const assert = require('node:assert');

const store = require('../src/data/memoryStore');
const orchestrator = require('../src/services/agentOrchestrator');
const projectService = require('../src/services/projectService');

test.beforeEach(() => {
  store.reset();
});

test('proje oluşturma ve listeleme', () => {
  const project = projectService.createProject('proj-1', {
    name: 'Test Projesi',
    description: 'Mobil uygulama denemesi'
  });

  assert.strictEqual(project.id, 'proj-1');
  assert.strictEqual(project.name, 'Test Projesi');

  const list = projectService.listProjectSummaries();
  assert.strictEqual(list.length, 1);
});

test('proje entegrasyonu ve görev eşlemesi', () => {
  projectService.createProject('proj-2');

  orchestrator.registerTask('build', { workflowId: 'wf-10' });

  const withIntegration = projectService.linkIntegration('proj-2', 'github', {
    repo: 'awesome-app'
  });

  assert.ok(withIntegration.integrations.github);
  assert.strictEqual(withIntegration.integrations.github.repo, 'awesome-app');

  const updatedProject = projectService.registerTaskMapping('proj-2', 'build', {
    runPolicy: 'auto'
  });

  assert.strictEqual(updatedProject.tasks.length, 1);
  assert.strictEqual(updatedProject.tasks[0].runPolicy, 'auto');
});
