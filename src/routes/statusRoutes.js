// App Lab Agent - Platform durum özetlerini ve son etkinlik listesini sunan HTTP yönlendiricisi.

const statusService = require('../services/statusService');

async function route({ method, pathname, query }) {
  if (method === 'GET' && pathname === '/api/status/summary') {
    const summary = statusService.buildPlatformSummary();
    return { status: 200, data: summary };
  }

  if (method === 'GET' && pathname === '/api/status/recent-activity') {
    const limit = query?.limit ? Number.parseInt(query.limit, 10) : undefined;
    const normalized = Number.isFinite(limit) && limit > 0 ? limit : undefined;
    const activity = statusService.getRecentActivity(normalized);
    return { status: 200, data: activity };
  }

  return null;
}

module.exports = { route };
