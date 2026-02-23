// Netlify Serverless Function (使用全局 fetch，避免额外依赖)
exports.handler = async (event, context) => {
  // 1. 获取环境变量中的API Key
  const JSONBIN_MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
  const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || '6995d9b2ae596e708f34a423';
  
  // 2. 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 3. 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (!JSONBIN_MASTER_KEY) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Missing JSONBIN_MASTER_KEY in environment' })
    };
  }

  try {
    const jsonbinUrl = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;
    
    // 4. 根据请求方法转发到JSONBin
    let response;
    if (event.httpMethod === 'GET') {
      response = await fetch(jsonbinUrl, {
        headers: { 'X-Master-Key': JSONBIN_MASTER_KEY }
      });
    } 
    else if (event.httpMethod === 'PUT') {
      const requestBody = JSON.parse(event.body || '{}');
      
      // 确保数据结构完整
      const dataToSave = {
        comments: Array.isArray(requestBody.comments) ? requestBody.comments : [],
        timeline: Array.isArray(requestBody.timeline) ? requestBody.timeline : []
      };
      
      response = await fetch(jsonbinUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_MASTER_KEY
        },
        body: JSON.stringify(dataToSave)
      });
    } 
    else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // 尝试解析 JSON，否则返回文本
    let bodyContent;
    try {
      bodyContent = await response.json();
    } catch (e) {
      bodyContent = await response.text();
    }

    return {
      statusCode: response.status,
      headers,
      body: typeof bodyContent === 'string' ? JSON.stringify({ message: bodyContent }) : JSON.stringify(bodyContent)
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Proxy error', 
        message: error.message 
      })
    };
  }
};
