// App Lab Agent - HTTP sunucusu; entegrasyon ve ajan yönetimi uç noktalarını yöneten ana giriş noktası.

const http = require('http');
const { URL } = require('url');
const integrationRoutes = require('./routes/integrationRoutes');
const taskRoutes = require('./routes/taskRoutes');
const projectRoutes = require('./routes/projectRoutes');
const agentProfileRoutes = require('./routes/agentProfileRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const environmentRoutes = require('./routes/environmentRoutes');
const buildRoutes = require('./routes/buildRoutes');
const releaseRoutes = require('./routes/releaseRoutes');
const pipelineRoutes = require('./routes/pipelineRoutes');
const statusRoutes = require('./routes/statusRoutes');

const PORT = process.env.PORT || 4000;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });

  if (data === null || typeof data === 'undefined') {
    return res.end();
  }

  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('İstek gövdesi çok büyük.'));
      }
    });

    req.on('end', () => {
      if (!body) {
        resolve(null);
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Geçersiz JSON gövdesi.'));
      }
    });

    req.on('error', (error) => reject(error));
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, null);
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/health') {
    return sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
  }

  let body = null;
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    try {
      body = await parseBody(req);
    } catch (error) {
      return sendJson(res, 400, { error: error.message });
    }
  }

  const payload = {
    method: req.method,
    pathname: url.pathname,
    body,
    query: Object.fromEntries(url.searchParams.entries())
  };

  try {
    const handlers = [
      integrationRoutes.route,
      agentProfileRoutes.route,
      taskRoutes.route,
      projectRoutes.route,
      workflowRoutes.route,
      environmentRoutes.route,
      buildRoutes.route,
      releaseRoutes.route,
      pipelineRoutes.route,
      statusRoutes.route
    ];
    for (const handler of handlers) {
      const result = await handler(payload);
      if (result) {
        return sendJson(res, result.status, result.data);
      }
    }

    return sendJson(res, 404, { error: 'Kaynak bulunamadı.' });
  } catch (error) {
    return sendJson(res, 500, {
      error: 'Beklenmeyen sunucu hatası meydana geldi.',
      details: error.message
    });
  }
});

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutesNew.js');
const aiRoutes = require('./routes/aiRoutesNew.js');

if (require.main === module) {
  dotenv.config();

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // Routes
  app.use('/api/user', userRoutes);
  app.use('/api/ai', aiRoutes);

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
      success: false,
      error: 'Something went wrong!',
      timestamp: new Date().toISOString()
    });
  });

  const EXPRESS_PORT = process.env.PORT || 3000;
  app.listen(EXPRESS_PORT, () => {
    console.log(`🚀 AppLab Agent platformu ${EXPRESS_PORT} portunda çalışıyor...`);
    console.log(`📊 Dashboard: http://localhost:${EXPRESS_PORT}`);
    console.log(`📚 API Health: http://localhost:${EXPRESS_PORT}/health`);
  });

  server.listen(PORT, () => {
    console.log(`🔧 HTTP sunucusu ${PORT} portunda çalışıyor...`);
  });
}

module.exports = server;
