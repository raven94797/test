后端代理（JSONBin Master Key）说明

目的：将 `X-Master-Key` 保存在服务器端，避免在客户端直接暴露 Master Key。

快速开始：

1. 在项目根目录创建 `.env` 文件，内容：

JSONBIN_BIN_ID=6995d9b2ae596e708f34a423
JSONBIN_MASTER_KEY=你的_master_key_here

2. 安装依赖并启动服务器：

```bash
npm install
````markdown
（已弃用）本项目已切换为 Netlify-only 部署，原本的本地代理说明已移除。

若需要保留本地代理用于调试，可参考旧版 `server.js` 实现并在本地设置 `.env`。不要把真实的 `JSONBIN_MASTER_KEY` 提交到仓库。

````

