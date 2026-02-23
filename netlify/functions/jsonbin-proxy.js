// Netlify Serverless Function
const fetch = require('node-fetch');

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

    const data = await response.json();
    
    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data)
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
