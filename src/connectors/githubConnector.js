// App Lab Agent - GitHub entegrasyonu için sahte bağlantı ve durum yönetimi modülü.

const store = require('../data/memoryStore');

function connect(token, options = {}) {
  if (!token) {
    throw new Error('GitHub bağlantısı için erişim tokenı zorunludur.');
  }

  const connection = store.setConnection('github', {
    status: 'connected',
    metadata: {
      repo: options.repo || null,
      organization: options.organization || null
    }
  });

  return connection;
}

function getStatus() {
  const connection = store.getConnection('github');
  return connection || { status: 'disconnected' };
}

function disconnect() {
  const current = store.getConnection('github');
  if (!current) {
    return { status: 'already_disconnected' };
  }

  store.setConnection('github', {
    status: 'disconnected',
    metadata: current.metadata || {}
  });

  return store.getConnection('github');
}

module.exports = {
  connect,
  getStatus,
  disconnect
};
