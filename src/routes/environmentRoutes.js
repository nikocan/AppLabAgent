// App Lab Agent - Alan adı ve yayın kanalı yönetimi HTTP uç noktalarını sunan yönlendirici modülü.

const environmentService = require('../services/environmentService');

function route({ method, pathname, body }) {
  try {
    if (method === 'GET' && pathname === '/api/environment') {
      return { status: 200, data: environmentService.getEnvironmentSnapshot() };
    }

    if (method === 'POST' && pathname === '/api/environment/domain') {
      const { domain } = body || {};
      const result = environmentService.updateDomain(domain);
      return { status: 200, data: result };
    }

    if (method === 'POST' && pathname === '/api/environment/releases') {
      const { platform, configuration } = body || {};
      const result = environmentService.registerReleaseChannel(platform, configuration);
      return { status: 200, data: result };
    }

    return null;
  } catch (error) {
    return { status: 500, data: { error: error.message || 'Sunucu hatası.' } };
  }
}

module.exports = { route };
