// App Lab Agent - Hostinger konektörünün bağlantı ve altyapı senkronizasyon davranışlarını doğrulayan testler.

const test = require('node:test');
const assert = require('node:assert');

const store = require('../src/data/memoryStore');
const hostingerConnector = require('../src/connectors/hostingerConnector');

test.beforeEach(() => {
  store.reset();
  global.fetch = undefined;
});

test('Hostinger bağlantısı API anahtarı ve alan adı meta verisini saklar', () => {
  const connection = hostingerConnector.connect('token-123', 'site-987', 'AppLabAgent.NET');

  assert.strictEqual(connection.metadata.domain, 'applabagent.net');
  assert.strictEqual(connection.metadata.apiKey, 'token-123');
});

test('Sanal sunucu listesi varsayılan bağlantı anahtarını kullanır', async () => {
  hostingerConnector.connect('token-abc', 'site-000');

  const mockedResponse = {
    ok: true,
    json: async () => ({
      data: [
        { id: 'vm-1', name: 'Production orchestrator' },
        { id: 'vm-2', name: 'Preview edge node' }
      ],
      meta: { total: 2, per_page: 25 }
    })
  };

  let receivedUrl;
  let receivedHeaders;
  global.fetch = async (url, options) => {
    receivedUrl = url;
    receivedHeaders = options?.headers;
    return mockedResponse;
  };

  const result = await hostingerConnector.listVirtualMachines();

  assert.match(receivedUrl, /\/api\/vps\/v1\/virtual-machines/);
  assert.strictEqual(receivedHeaders.Authorization, 'Bearer token-abc');
  assert.strictEqual(result.meta.total, 2);
  assert.strictEqual(result.machines.length, 2);
});

test('Sanal sunucu listesi başarısız HTTP durumunda hata döndürür', async () => {
  hostingerConnector.connect('token-def', 'site-123');

  global.fetch = async () => ({
    ok: false,
    status: 401,
    statusText: 'Unauthorized',
    text: async () => 'invalid token'
  });

  await assert.rejects(() => hostingerConnector.listVirtualMachines(), (error) => {
    assert.match(error.message, /Hostinger API hatası \(401\)/);
    assert.match(error.message, /invalid token/);
    return true;
  });
});

test('Harici anahtar ile sayfalı istek yapılabilir', async () => {
  global.fetch = async (url) => {
    const parsed = new URL(url);
    assert.strictEqual(parsed.searchParams.get('page'), '3');
    return {
      ok: true,
      json: async () => ({ items: [] })
    };
  };

  const result = await hostingerConnector.listVirtualMachines({ apiKey: 'external-key', page: 3 });
  assert.deepStrictEqual(result.machines, []);
});

test.after(() => {
  delete global.fetch;
});
