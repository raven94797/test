// netlify/functions/jsonbin-proxy.js
// 经过验证的实现：使用全局 fetch（Netlify Node 18+），包含 CORS、OPTIONS 预检、GET/PUT
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Master-Key',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || '6995d9b2ae596e708f34a423';
    const JSONBIN_MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
    if (!JSONBIN_MASTER_KEY) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'JSONBIN_MASTER_KEY 环境变量未设置' }) };
    }
    const jsonbinUrl = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

    // GET: 读取
    if (event.httpMethod === 'GET') {
      const resp = await fetch(jsonbinUrl, { headers: { 'X-Master-Key': JSONBIN_MASTER_KEY, 'X-Bin-Meta': 'false' } });
      if (!resp.ok) {
        const errText = await resp.text();
        return { statusCode: resp.status, headers, body: JSON.stringify({ error: errText }) };
      }
      const data = await resp.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // PUT: 保存
    if (event.httpMethod === 'PUT') {
      let requestBody = {};
      try { requestBody = JSON.parse(event.body || '{}'); } catch (e) { return { statusCode: 400, headers, body: JSON.stringify({ error: '请求体不是有效 JSON' }) }; }

      const dataToSave = {
        comments: Array.isArray(requestBody.comments) ? requestBody.comments : [],
        timeline: Array.isArray(requestBody.timeline) ? requestBody.timeline : []
      };

      const resp = await fetch(jsonbinUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_MASTER_KEY },
        body: JSON.stringify(dataToSave)
      });

      if (!resp.ok) {
        const errText = await resp.text();
        return { statusCode: resp.status, headers, body: JSON.stringify({ error: errText }) };
      }
      const result = await resp.json();
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: '方法不允许' }) };
  } catch (error) {
    console.error('代理函数内部错误:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: '内部服务器错误', message: error.message }) };
  }
};
