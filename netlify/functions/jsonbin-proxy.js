// netlify/functions/jsonbin-proxy.js
// 稳定版代理实现 —— 使用全局 fetch（Netlify 使用 Node 18+），并带完整 CORS 与错误处理
exports.handler = async (event, context) => {
  // 设置CORS头部
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || '6995d9b2ae596e708f34a423';
    const JSONBIN_MASTER_KEY = process.env.JSONBIN_MASTER_KEY;

    if (!JSONBIN_MASTER_KEY) {
      throw new Error('JSONBIN_MASTER_KEY 环境变量未设置');
    }

    const jsonbinUrl = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

    // GET 请求 - 读取数据
    if (event.httpMethod === 'GET') {
      const response = await fetch(jsonbinUrl, {
        headers: {
          'X-Master-Key': JSONBIN_MASTER_KEY,
          'X-Bin-Meta': 'false'
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`读取失败: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    // PUT 请求 - 保存数据
    if (event.httpMethod === 'PUT') {
      const requestBody = JSON.parse(event.body || '{}');

      // 确保数据结构完整
      const dataToSave = {
        comments: Array.isArray(requestBody.comments) ? requestBody.comments : [],
        timeline: Array.isArray(requestBody.timeline) ? requestBody.timeline : []
      };

      const response = await fetch(jsonbinUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_MASTER_KEY
        },
        body: JSON.stringify(dataToSave)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`保存失败: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

    // 不支持的请求方法
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: '方法不允许' })
    };

  } catch (error) {
    console.error('代理函数错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '内部服务器错误',
        message: error.message
      })
    };
  }
};
};
