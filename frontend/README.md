# 时光遗嘱 · 前端（frontend）

React 19 + Vite 8 + Tailwind CSS 4 实现的单页应用，界面包含立嘱向导、遗言解锁门户与立嘱人管理面板。

后端服务位于同级目录 [`../backend`](../backend)，本目录只负责界面与交互，所有数据通过 `/api/*` 接口获取。

## 环境要求

- Node.js `^20.19.0 || >=22.12.0`（Vite 8 的最低要求；后端可使用 Node 16.9.0，两者相互独立）

## 本地运行

1. 安装依赖：

   ```bash
   npm install
   ```

   > 若 npm 报 `Cannot read properties of null (reading 'edgesOut')`（npm 10.8.x 解析 Vite 8 可选 peer 依赖的已知缺陷），改用 `npm install --legacy-peer-deps`。
   > 若构建报 `Cannot find module './rolldown-binding.win32-x64-msvc.node'`，补装平台二进制：`npm i -D @rolldown/binding-win32-x64-msvc`。

2. 配置环境变量（可选）：

   ```bash
   cp .env.example .env
   ```

   - `VITE_API_PROXY_TARGET`：后端接口地址，默认 `http://localhost:4000`
   - `FRONTEND_PORT`：前端开发服务器端口，默认 `5173`

3. 启动开发服务器：

   ```bash
   npm run dev
   ```

   浏览器访问 <http://localhost:5173>。开发环境下 `/api` 请求会被 Vite 代理转发到后端，因此无需处理跨域。

> 请先启动后端服务（见 [`../backend/README.md`](../backend/README.md)），否则接口请求会失败。

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器（默认端口 5173） |
| `npm run build` | 生产构建，产物输出到 `dist/` |
| `npm run preview` | 本地预览 `dist/` 构建产物 |
| `npm run lint` | TypeScript 类型检查（`tsc --noEmit`） |
| `npm run clean` | 清理 `dist/` |

## 目录结构

```
frontend/
├── index.html          # 入口 HTML
├── vite.config.ts      # Vite 配置（含 /api 代理）
├── tsconfig.json
├── metadata.json       # 应用元信息
└── src/
    ├── App.tsx         # 页面骨架与全局状态
    ├── main.tsx
    ├── index.css
    ├── assets/         # 图片等静态资源
    ├── components/     # 各功能区块组件
    ├── data/           # 前端静态文案与清单数据
    ├── types/          # 与后端共享的数据类型定义
    └── utils/api.ts    # 接口请求封装
```

## 接口约定

前端统一使用相对路径 `/api/...`：

- 开发环境：由 `vite.config.ts` 的 proxy 转发到 `VITE_API_PROXY_TARGET`
- 生产环境：`frontend/dist` 由后端 Express 直接托管，相对路径同样可用

如需接入其他域名的后端，可通过 Nginx / 网关把 `/api` 反向代理到后端服务。
