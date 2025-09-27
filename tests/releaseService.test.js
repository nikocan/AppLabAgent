// App Lab Agent - Çoklu platform sürüm servisinin davranışlarını doğrulayan testler.

const test = require('node:test');
const assert = require('node:assert');

const memoryStore = require('../src/data/memoryStore');
const projectService = require('../src/services/projectService');
const buildService = require('../src/services/buildService');
const releaseService = require('../src/services/releaseService');

function resetState() {
  memoryStore.reset();
}

test('sürüm oluşturma platform varsayılanlarını üretir', () => {
  resetState();
  projectService.createProject('proj-1', { name: 'Mobil Uygulama' });

  const release = releaseService.createRelease({
    id: 'rel-1',
    projectId: 'proj-1',
    version: '1.0.0',
    platforms: ['android', 'ios'],
    notes: 'İlk canlı dağıtım'
  });

  assert.strictEqual(release.id, 'rel-1');
  assert.strictEqual(release.projectId, 'proj-1');
  assert.strictEqual(release.version, '1.0.0');
  assert.strictEqual(release.status, 'draft');
  assert.ok(Array.isArray(release.history));
  assert.strictEqual(release.history.length, 1);
  assert.ok(release.platforms.android);
  assert.strictEqual(release.platforms.android.status, 'pending');
  assert.ok(release.platforms.ios);
});

test('build ilişkilendirme platform durumunu günceller', () => {
  resetState();
  projectService.createProject('proj-2');
  const build = buildService.createBuild({
    id: 'build-android',
    projectId: 'proj-2',
    platform: 'android',
    version: '1.0.1'
  });

  releaseService.createRelease({
    id: 'rel-2',
    projectId: 'proj-2',
    platforms: ['android']
  });

  const platformState = releaseService.assignPlatformBuild('rel-2', 'android', build.id, 'release-bot');
  assert.strictEqual(platformState.buildId, build.id);
  assert.strictEqual(platformState.status, 'in_progress');
  assert.strictEqual(platformState.storeStatus, 'not_submitted');

  const afterUpdate = releaseService.updatePlatformStatus(
    'rel-2',
    'android',
    {
      status: 'submitted',
      storeStatus: 'in_review',
      submissionNotes: 'Google Play Console gönderimi tamamlandı',
      message: 'Android build incelemede'
    },
    'release-manager'
  );

  assert.strictEqual(afterUpdate.status, 'submitted');
  assert.strictEqual(afterUpdate.storeStatus, 'in_review');
  assert.strictEqual(afterUpdate.submissionNotes, 'Google Play Console gönderimi tamamlandı');

  const releaseDetail = releaseService.getReleaseDetail('rel-2');
  assert.strictEqual(releaseDetail.history.length, 3);
});

test('sürüm statü terfisi listede yansır', () => {
  resetState();
  projectService.createProject('proj-3');

  releaseService.createRelease({ id: 'rel-3', projectId: 'proj-3', version: '2.0.0' });
  releaseService.createRelease({ id: 'rel-4', projectId: 'proj-3', version: '2.1.0' });

  releaseService.promoteRelease('rel-3', 'in_progress', 'ops');
  releaseService.promoteRelease('rel-3', 'published', 'ops');

  const summaries = releaseService.listReleaseSummaries({ projectId: 'proj-3' });
  assert.strictEqual(summaries.length, 2);
  const published = summaries.find((item) => item.id === 'rel-3');
  assert.strictEqual(published.status, 'published');
});
