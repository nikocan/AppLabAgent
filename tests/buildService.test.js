// App Lab Agent - Derleme servisinin uçtan uca davranışını doğrulayan test senaryoları.

const test = require('node:test');
const assert = require('node:assert');

const memoryStore = require('../src/data/memoryStore');
const projectService = require('../src/services/projectService');
const buildService = require('../src/services/buildService');
const automationRunner = require('../src/services/automationRunner');

function resetState() {
  memoryStore.reset();
  automationRunner.resetQueue();
}

test('derleme oluşturma ve sorgulama filtreleri çalışır', () => {
  resetState();
  projectService.createProject('app-demo', { name: 'Demo' });

  const build = buildService.createBuild({
    projectId: 'app-demo',
    platform: 'android',
    version: '1.0.0',
    notes: 'İlk deneme'
  });

  assert.strictEqual(build.status, 'queued');
  assert.strictEqual(build.projectId, 'app-demo');
  assert.ok(Array.isArray(build.history));
  assert.strictEqual(build.history.length, 1);

  const builds = buildService.listBuildsForQuery({ projectId: 'app-demo', platform: 'android' });
  assert.strictEqual(builds.length, 1);
  assert.strictEqual(builds[0].version, '1.0.0');
});

test('derleme tetikleme kuyruğu otomatik olarak tamamlanmış bir artefact üretir', () => {
  resetState();
  projectService.createProject('app-demo');

  const build = buildService.createBuild({
    projectId: 'app-demo',
    platform: 'ios',
    version: '1.2.3'
  });

  buildService.triggerBuild(build.id, {
    notes: 'Beta build başlatıldı',
    completionNotes: 'CI pipeline başarıyla tamamlandı',
    artifactUrl: 'https://cdn.example.com/app-demo/ios/app.ipa'
  });

  const processed = automationRunner.processNext();
  assert.strictEqual(processed.status, 'built');
  assert.strictEqual(processed.artifactUrl, 'https://cdn.example.com/app-demo/ios/app.ipa');

  const stored = buildService.getBuildById(build.id);
  assert.strictEqual(stored.status, 'built');
  assert.strictEqual(stored.history.length, 3);
  assert.strictEqual(stored.history[0].status, 'queued');
  assert.strictEqual(stored.history[1].status, 'building');
  assert.strictEqual(stored.history[2].status, 'built');
});

test('manuel durum güncellemesi geçmiş kaydını genişletir', () => {
  resetState();
  projectService.createProject('app-demo');

  const build = buildService.createBuild({
    projectId: 'app-demo',
    platform: 'android',
    version: '2.0.0'
  });

  const updated = buildService.updateBuildStatus(build.id, {
    status: 'failed',
    notes: 'Derleme aşamasında test hatası'
  });

  assert.strictEqual(updated.status, 'failed');
  const stored = buildService.getBuildById(build.id);
  assert.strictEqual(stored.history.length, 2);
  assert.strictEqual(stored.history[1].status, 'failed');
  assert.strictEqual(stored.history[1].notes, 'Derleme aşamasında test hatası');
});
