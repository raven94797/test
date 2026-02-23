const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
const JSONBIN_MASTER_KEY = process.env.JSONBIN_MASTER_KEY;

if (!JSONBIN_BIN_ID || !JSONBIN_MASTER_KEY) {
    console.error('环境变量 JSONBIN_BIN_ID 或 JSONBIN_MASTER_KEY 未设置。请查看 README.md 获取说明。');
}

const JSONBIN_API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

const app = express();
app.use(express.json({ limit: '2mb' }));

// 将当前目录作为静态目录，方便直接访问 index.html
app.use(express.static(path.join(__dirname)));

// 日志中间件（简易）
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} -> ${req.method} ${req.url}`);
    next();
});

// 简单的代理：GET -> 从 JSONBin 获取记录并返回原始响应
app.get('/api/jsonbin', async (req, res) => {
    try {
        const resp = await fetch(JSONBIN_API_URL, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_MASTER_KEY
            }
        });

        const text = await resp.text();
        let data;
        try { data = JSON.parse(text); } catch(e) { data = text; }

        console.log(`/api/jsonbin GET -> JSONBin status=${resp.status}`);
        res.status(resp.status).send(data);
    } catch (err) {
        console.error('GET /api/jsonbin error', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT -> 将客户端发送的 body 直接写回 JSONBin（使用 Master Key）
app.put('/api/jsonbin', async (req, res) => {
    try {
        console.log('/api/jsonbin PUT body length:', req.headers['content-length'] || 'unknown');
        const resp = await fetch(JSONBIN_API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_MASTER_KEY
            },
            body: JSON.stringify(req.body)
        });

        const text = await resp.text();
        let data;
        try { data = JSON.parse(text); } catch(e) { data = text; }

        console.log(`/api/jsonbin PUT -> JSONBin status=${resp.status}`);
        console.log('JSONBin response:', typeof data === 'string' ? data.slice(0,200) : JSON.stringify(data).slice(0,200));
        res.status(resp.status).send(data);
    } catch (err) {
        console.error('PUT /api/jsonbin error', err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`JSONBin proxy server listening on http://localhost:${PORT}`);
});
