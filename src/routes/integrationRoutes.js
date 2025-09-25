// App Lab Agent - GitHub, Hostinger ve n8n entegrasyon uç noktalarını haritalayan yönlendirici modül.

const githubConnector = require('../connectors/githubConnector');
const hostingerConnector = require('../connectors/hostingerConnector');
const n8nConnector = require('../connectors/n8nConnector');

function route({ method, pathname, body }) {
  if (method === 'POST' && pathname === '/api/integrations/github/connect') {
    const { token, repo, organization } = body || {};
    const connection = githubConnector.connect(token, { repo, organization });
    return { status: 200, data: connection };
  }

  if (method === 'GET' && pathname === '/api/integrations/github/status') {
    return { status: 200, data: githubConnector.getStatus() };
  }

  if (method === 'POST' && pathname === '/api/integrations/github/disconnect') {
    return { status: 200, data: githubConnector.disconnect() };
  }

  if (method === 'POST' && pathname === '/api/integrations/hostinger/connect') {
    const { apiKey, siteId, domain } = body || {};
    return { status: 200, data: hostingerConnector.connect(apiKey, siteId, domain) };
  }

  if (method === 'GET' && pathname === '/api/integrations/hostinger/status') {
    return { status: 200, data: hostingerConnector.getStatus() };
  }

  if (method === 'POST' && pathname === '/api/integrations/hostinger/deploy') {
    const { target } = body || {};
    return { status: 200, data: hostingerConnector.triggerDeployment(target) };
  }

  if (method === 'POST' && pathname === '/api/integrations/n8n/connect') {
    const { baseUrl, apiKey } = body || {};
    return { status: 200, data: n8nConnector.connect(baseUrl, apiKey) };
  }

  if (method === 'GET' && pathname === '/api/integrations/n8n/status') {
    return { status: 200, data: n8nConnector.getStatus() };
  }

  if (method === 'POST' && pathname === '/api/integrations/n8n/trigger') {
    const { workflowId, input } = body || {};
    return { status: 200, data: n8nConnector.triggerWorkflow(workflowId, input) };
  }

  return null;
}

module.exports = { route };
