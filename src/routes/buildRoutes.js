// App Lab Agent - Derleme yönetimi uç noktalarını yöneten minimal HTTP yönlendiricisi.

const buildService = require('../services/buildService');

function route({ method, pathname, body, query }) {
  if (method === 'POST' && pathname === '/api/builds') {
    try {
      const build = buildService.createBuild(body || {});
      return { status: 201, data: build };
    } catch (error) {
      return { status: 400, data: { error: error.message } };
    }
  }

  if (method === 'POST' && pathname.startsWith('/api/builds/') && pathname.endsWith('/trigger')) {
    const buildId = pathname.split('/')[3];
    try {
      const build = buildService.triggerBuild(buildId, body || {});
      return { status: 200, data: { message: 'Derleme kuyruğa gönderildi', build } };
    } catch (error) {
      return { status: 404, data: { error: error.message } };
    }
  }

  if (method === 'PATCH' && pathname.startsWith('/api/builds/') && pathname.endsWith('/status')) {
    const buildId = pathname.split('/')[3];
    try {
      const build = buildService.updateBuildStatus(buildId, body || {});
      return { status: 200, data: build };
    } catch (error) {
      return { status: 404, data: { error: error.message } };
    }
  }

  if (method === 'GET' && pathname.startsWith('/api/builds/') && pathname.split('/').length === 4) {
    const buildId = pathname.split('/')[3];
    try {
      const build = buildService.getBuildById(buildId);
      return { status: 200, data: build };
    } catch (error) {
      return { status: 404, data: { error: error.message } };
    }
  }

  if (method === 'GET' && pathname === '/api/builds') {
    const builds = buildService.listBuildsForQuery(query || {});
    return { status: 200, data: builds };
  }

  return null;
}

module.exports = { route };
