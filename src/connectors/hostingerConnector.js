// App Lab Agent - Hostinger dağıtım ortamı için bağlantı, yayın tetikleme ve altyapı senkronizasyon modülü.

const store = require('../data/memoryStore');

const HOSTINGER_API_BASE_URL = (process.env.HOSTINGER_API_BASE_URL || 'https://developers.hostinger.com').replace(/\/$/, '');

function connect(apiKey, siteId, domain) {
  if (!apiKey || !siteId) {
    throw new Error('Hostinger bağlantısı için API anahtarı ve site kimliği gereklidir.');
  }

  const environment = store.getEnvironment();
  const mappedDomain = (domain || environment.domain || '').trim().toLowerCase();

  if (!mappedDomain) {
    throw new Error('Hostinger bağlantısı için alan adı yapılandırması gereklidir.');
  }

  return store.setConnection('hostinger', {
    status: 'connected',
    metadata: {
      siteId,
      domain: mappedDomain,
      apiKey
    }
  });
}

function getStatus() {
  return store.getConnection('hostinger') || { status: 'disconnected' };
}

function triggerDeployment(target = 'staging') {
  const connection = store.getConnection('hostinger');
  if (!connection || connection.status !== 'connected') {
    throw new Error('Hostinger dağıtımı için önce bağlantı kurulmalıdır.');
  }

  return {
    status: 'deployment_requested',
    target,
    domain: connection.metadata?.domain || null,
    requestedAt: new Date().toISOString()
  };
}

async function listVirtualMachines({ apiKey, page = 1 } = {}) {
  const connection = store.getConnection('hostinger');
  const resolvedApiKey = apiKey || connection?.metadata?.apiKey;

  if (!resolvedApiKey) {
    throw new Error('Hostinger sanal sunucularını sorgulamak için API anahtarı gereklidir.');
  }

  const url = new URL('/api/vps/v1/virtual-machines', HOSTINGER_API_BASE_URL);
  if (page) {
    url.searchParams.set('page', String(page));
  }

  let response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${resolvedApiKey}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    throw new Error(`Hostinger API isteği başarısız oldu: ${error.message}`);
  }

  if (!response.ok) {
    let errorDetails = '';
    try {
      errorDetails = await response.text();
    } catch (error) {
      errorDetails = error.message;
    }
    throw new Error(`Hostinger API hatası (${response.status}): ${errorDetails || response.statusText}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error(`Hostinger API yanıtı JSON olarak ayrıştırılamadı: ${error.message}`);
  }

  const machines = Array.isArray(payload?.data)
    ? payload.data
    : payload?.virtual_machines || payload?.items || [];

  const meta = {
    page,
    total: payload?.meta?.total ?? payload?.total ?? null,
    perPage: payload?.meta?.per_page ?? payload?.perPage ?? null
  };

  return {
    fetchedAt: new Date().toISOString(),
    machines,
    meta,
    raw: payload
  };
}

module.exports = {
  connect,
  getStatus,
  triggerDeployment,
  listVirtualMachines
};
