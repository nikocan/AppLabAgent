// App Lab Agent - Hostinger dağıtım ortamı için temel bağlantı ve yayın simülasyon modülü.

const store = require('../data/memoryStore');

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
      domain: mappedDomain
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

module.exports = {
  connect,
  getStatus,
  triggerDeployment
};
