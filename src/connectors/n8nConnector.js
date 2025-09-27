// App Lab Agent - n8n otomasyon akışları için bağlantı ve tetikleme simülasyonu modülü.

const store = require('../data/memoryStore');

function connect(baseUrl, apiKey) {
  if (!baseUrl || !apiKey) {
    throw new Error('n8n bağlantısı için temel URL ve API anahtarı gereklidir.');
  }

  return store.setConnection('n8n', {
    status: 'connected',
    metadata: {
      baseUrl
    }
  });
}

function getStatus() {
  return store.getConnection('n8n') || { status: 'disconnected' };
}

function triggerWorkflow(workflowId, input = {}) {
  const connection = store.getConnection('n8n');
  if (!connection || connection.status !== 'connected') {
    throw new Error('n8n akışını tetiklemek için bağlantı kurulmalıdır.');
  }

  return {
    status: 'workflow_triggered',
    workflowId,
    input,
    triggeredAt: new Date().toISOString()
  };
}

module.exports = {
  connect,
  getStatus,
  triggerWorkflow
};
