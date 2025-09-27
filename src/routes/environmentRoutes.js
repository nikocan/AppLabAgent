// App Lab Agent - Alan adı ve yayın kanalı yönetimi HTTP uç noktalarını sunan yönlendirici modülü.

const environmentService = require('../services/environmentService');

function route({ method, pathname, body }) {
  if (method === 'GET' && pathname === '/api/environment') {
    return { status: 200, data: environmentService.getEnvironmentSnapshot() };
  }

  if (method === 'POST' && pathname === '/api/environment/domain') {
    const { domain } = body || {};
    return { status: 200, data: environmentService.updateDomain(domain) };
  }

  if (method === 'POST' && pathname === '/api/environment/releases') {
    const { platform, configuration } = body || {};
    return { status: 200, data: environmentService.registerReleaseChannel(platform, configuration) };
  }

  return null;
}

module.exports = { route };
