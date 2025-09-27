// App Lab Agent - Yapay zeka ajan profili yönetimi için HTTP yönlendiricisi.

const {
  registerAgentProfile,
  updateAgentProfile,
  listAgentProfilesWithFilters,
  getAgentProfileById,
  linkProfileToProject,
  removeAgentProfile
} = require('../services/aiAgentService');

function route({ method, pathname, body, query }) {
  if (method === 'POST' && pathname === '/api/agents') {
    try {
      const profile = registerAgentProfile(body || {});
      return { status: 201, data: profile };
    } catch (error) {
      return { status: 400, data: { error: error.message } };
    }
  }

  if (method === 'GET' && pathname === '/api/agents') {
    const agents = listAgentProfilesWithFilters(query || {});
    return { status: 200, data: agents };
  }

  const agentMatch = pathname.match(/^\/api\/agents\/([^/]+)$/);
  if (agentMatch) {
    const agentId = agentMatch[1];

    if (method === 'GET') {
      const agent = getAgentProfileById(agentId);
      if (!agent) {
        return { status: 404, data: { error: 'Ajan profili bulunamadı.' } };
      }
      return { status: 200, data: agent };
    }

    if (method === 'PATCH') {
      try {
        const updated = updateAgentProfile(agentId, body || {});
        return { status: 200, data: updated };
      } catch (error) {
        return { status: 404, data: { error: error.message } };
      }
    }

    if (method === 'DELETE') {
      const removed = removeAgentProfile(agentId);
      if (!removed) {
        return { status: 404, data: { error: 'Ajan profili bulunamadı.' } };
      }
      return { status: 204, data: null };
    }
  }

  const linkMatch = pathname.match(/^\/api\/agents\/([^/]+)\/link$/);
  if (linkMatch && method === 'POST') {
    const agentId = linkMatch[1];
    const { projectId } = body || {};
    try {
      const agent = linkProfileToProject(agentId, projectId || null);
      return { status: 200, data: agent };
    } catch (error) {
      return { status: 404, data: { error: error.message } };
    }
  }

  return null;
}

module.exports = { route };
