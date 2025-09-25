// App Lab Agent - Ortam servisi alan adı ve yayın kanalı davranışlarını doğrulayan testler.

const test = require('node:test');
const assert = require('node:assert');

const store = require('../src/data/memoryStore');
const environmentService = require('../src/services/environmentService');
const hostingerConnector = require('../src/connectors/hostingerConnector');

test.beforeEach(() => {
  store.reset();
});

test('Varsayılan ortam özeti alan adını ve bağlantı durumunu döndürür', () => {
  const snapshot = environmentService.getEnvironmentSnapshot();
  assert.strictEqual(snapshot.domain, 'applabagent.net');
  assert.strictEqual(snapshot.hostinger.status, 'disconnected');
});

test('Alan adı güncellemesi Hostinger meta verisiyle senkronize edilir', () => {
  hostingerConnector.connect('hostinger-key', 'site-xyz');
  const updated = environmentService.updateDomain('AppLabAgent.net');

  assert.strictEqual(updated.domain, 'applabagent.net');

  const hostingerStatus = hostingerConnector.getStatus();
  assert.strictEqual(hostingerStatus.metadata.domain, 'applabagent.net');
});

test('Yayın kanalı kaydı zorunlu alanları doğrular', () => {
  const channel = environmentService.registerReleaseChannel('android', {
    packageName: 'com.applabagent.mobile',
    track: 'internal'
  });
  assert.strictEqual(channel.packageName, 'com.applabagent.mobile');

  assert.throws(() => {
    environmentService.registerReleaseChannel('ios', { bundleId: 'com.applabagent.ios' });
  }, /Eksik yapılandırma alanları/);
});
