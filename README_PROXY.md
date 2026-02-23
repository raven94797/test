后端代理（JSONBin Master Key）说明

目的：将 `X-Master-Key` 保存在服务器端，避免在客户端直接暴露 Master Key。

快速开始：

1. 在项目根目录创建 `.env` 文件，内容：

JSONBIN_BIN_ID=6995d9b2ae596e708f34a423
JSONBIN_MASTER_KEY=你的_master_key_here

2. 安装依赖并启动服务器：

```bash
npm install
npm start
```

3. 打开浏览器访问：

http://localhost:3000/index.html

说明：
- 服务器提供两个接口：
  - `GET /api/jsonbin`：从 JSONBin 拉取记录并返回（原样转发 JSONBin 响应）。
  - `PUT /api/jsonbin`：将客户端传入的 JSON 体 PUT 回 JSONBin（使用 Master Key）。
- 客户端代码已修改为调用这两个接口，客户端不再包含 Master Key。

安全建议：
- 仅将 Master Key 存放在服务器环境变量或受保护的配置中。
- 若需要对写入做权限控制，可在代理层添加认证（例如简单的 API token）。
