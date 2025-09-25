// App Lab Agent - HTTP sunucusu; entegrasyon ve ajan yönetimi uç noktalarını yöneten ana giriş noktası.

const http = require('http');
const { URL } = require('url');
const integrationRoutes = require('./routes/integrationRoutes');
const taskRoutes = require('./routes/taskRoutes');
const projectRoutes = require('./routes/projectRoutes');

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
    body
  };

  try {
    const handlers = [integrationRoutes.route, taskRoutes.route, projectRoutes.route];
    for (const handler of handlers) {
      const result = handler(payload);
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

if (require.main === module) {
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`App Lab Agent sunucusu ${PORT} portunda çalışıyor.`);
  });
}

module.exports = server;
