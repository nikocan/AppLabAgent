// App Lab Agent - Hostinger dağıtım ortamı için temel bağlantı ve yayın simülasyon modülü.

const store = require('../data/memoryStore');

function connect(apiKey, siteId) {
  if (!apiKey || !siteId) {
    throw new Error('Hostinger bağlantısı için API anahtarı ve site kimliği gereklidir.');
  }

  return store.setConnection('hostinger', {
    status: 'connected',
    metadata: {
      siteId
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
    requestedAt: new Date().toISOString()
  };
}

module.exports = {
  connect,
  getStatus,
  triggerDeployment
};
