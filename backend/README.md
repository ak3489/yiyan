# 时光遗嘱 · 后端（backend）

基于 **Node.js 16.9.0 + Express + MongoDB** 的 REST API 服务，取代原先写死在 `frontend/server.ts` 中的 Express + 本地 JSON 文件实现。

前端应用位于同级目录 [`../frontend`](../frontend)。

## 功能

- 遗言信标的创建 / 查询 / 更新 / 撤回销毁，数据持久化到 MongoDB
- 服务器权威时间接口（防客户端时间篡改）与信标时间锁
- 接收者密码解锁、立嘱人管理密钥校验（编辑与撤回）
- 生产模式下直接托管 `frontend/dist` 静态资源，单进程即可部署

## 环境要求

| 组件 | 版本 |
| --- | --- |
| Node.js | `>=16.9.0`（推荐 16.9.0，代码按该版本的语法与 API 编写） |
| MongoDB | `>=4.4`（本地单机或 Atlas 均可） |

> 后端代码刻意不使用 Node 18+ 的特性（如全局 `fetch`、`node --watch`），以兼容 Node 16.9.0。
> 开发期热重载使用 `nodemon`，正式运行使用 `node src/index.js`。

## 快速开始

1. 安装依赖：

   ```bash
   npm install
   ```

2. 准备 MongoDB：

   - 本地：确保 `mongod` 已启动，默认地址 `mongodb://127.0.0.1:27017`
   - 云端：使用 MongoDB Atlas 连接串

3. 配置环境变量：

   ```bash
   cp .env.example .env
   ```

   | 变量 | 默认值 | 说明 |
   | --- | --- | --- |
   | `PORT` | `4000` | 服务监听端口 |
   | `NODE_ENV` | `development` | `production` 时启用严格错误信息隐藏 |
   | `MONGODB_URI` | `mongodb://127.0.0.1:27017` | MongoDB 连接串 |
   | `MONGODB_DB` | `yiyan_testament` | 数据库名 |
   | `CORS_ORIGIN` | `http://localhost:5173` | 允许跨域的前端来源，多个用英文逗号分隔，`*` 表示不限制 |
   | `FRONTEND_DIST` | `../frontend/dist` | 前端构建产物目录（相对 `backend/`） |
   | `MONGO_RETRY_WRITES` | `false` | 单节点 mongod 请保持 `false`，副本集/Atlas 可设为 `true` |

4. 写入演示数据（可选）：

   ```bash
   npm run seed
   ```

5. 启动服务：

   ```bash
   npm run dev     # 开发（nodemon 热重载）
   npm start       # 生产
   ```

6. 验证：

   ```bash
   curl http://localhost:4000/api/health
   ```

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | nodemon 启动开发模式 |
| `npm start` | 启动服务 |
| `npm run seed` | 写入/更新演示数据（幂等，可重复执行） |
| `npm run check` | 语法自检 |

## 接口文档

所有接口前缀为 `/api`。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/health` | 健康检查（含信标总数） |
| `GET` | `/api/time` | 服务器权威时间 `{ now, iso }` |
| `GET` | `/api/capsules` | 信标公开列表（不含敏感信息） |
| `GET` | `/api/capsules/:id` | 单个信标公开信息（信标编号忽略大小写） |
| `POST` | `/api/capsules/:id/unlock` | 接收者解锁，body `{ password }` |
| `POST` | `/api/capsules` | 创建信标，返回 `id` 与 `adminKey` |
| `POST` | `/api/capsules/:id/verify-admin` | 校验管理密钥并返回完整信标 |
| `PUT` | `/api/capsules/:id` | 更新信标，body 含 `adminKey` |
| `DELETE` | `/api/capsules/:id` | 撤回销毁信标，body 含 `adminKey` |

### 解锁返回示例

密码正确但未到开启时间：

```json
{
  "success": false,
  "isTimeLocked": true,
  "matchesPassword": true,
  "serverTime": 1792606641513,
  "unlockAt": 1824185841513,
  "remainingMs": 31579200000,
  "message": "密码验证成功！但根据立嘱人设定，该遗言受服务器时间锁保护……"
}
```

密码正确且已到开启时间：

```json
{
  "success": true,
  "serverTime": 1792606641513,
  "unlockAt": 1792563441513,
  "title": "致小芸与家人的信：资产交代与心底话",
  "recipientName": "爱妻小芸与儿子辰辰",
  "payload": { "letter": {}, "bankAccounts": [], "physicalItems": [], "digitalAccounts": [], "finalWishes": {} }
}
```

## 数据模型

集合 `capsules`（数据库 `MONGODB_DB`）：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 信标编号，如 `TST-K7QM-4821`（唯一） |
| `idUpper` | string | `id` 的大写形式，用于忽略大小写查询（唯一索引） |
| `adminKey` | string | 立嘱人管理密钥 |
| `title` / `recipientName` | string | 标题与收信人 |
| `unlockAt` / `createdAt` / `updatedAt` | number | 毫秒时间戳 |
| `password` / `passwordHint` | string | 访问密码与密码提示 |
| `status` | string | `active` 或 `revoked` |
| `payload` | object | 遗言正文（信件、银行卡、实物、数字账号、临终愿望等） |

索引：`idUpper`（唯一）、`status + unlockAt`、`createdAt`（倒序）。

## 目录结构

```
backend/
├── .env.example
├── package.json
├── scripts/
│   └── seed.js             # 演示数据导入脚本
└── src/
    ├── index.js            # 进程入口：连接数据库、监听端口、优雅退出
    ├── app.js              # Express 应用装配（中间件、静态托管、错误处理）
    ├── db.js               # MongoDB 连接管理
    ├── config/index.js     # 环境变量配置
    ├── models/capsule.js   # 集合访问与索引、字段映射
    ├── routes/
    │   ├── index.js        # /api 路由汇总 + 健康检查
    │   ├── time.js         # 服务器时间
    │   └── capsules.js     # 信标增删改查与解锁
    ├── seed/demoData.json  # 演示数据
    └── utils/
        ├── ids.js          # 信标编号 / 管理密钥生成
        └── asyncHandler.js # 异步路由错误捕获
```

## 与前端的联调

- 开发：先启动本服务（4000），再启动前端 `npm run dev`（5173）。前端 Vite 会把 `/api` 代理到 `http://localhost:4000`。
- 生产：先在 `frontend/` 执行 `npm run build`，然后启动本服务；后端会自动托管 `frontend/dist`，访问 `http://localhost:4000` 即可获得完整应用。

## 安全提示

- 当前版本沿用原实现，访问密码与管理密钥以明文存于数据库，**上线前请改为哈希存储**（如 `bcrypt`）并改用环境变量注入的密钥。
- 生产环境务必设置 `CORS_ORIGIN` 为具体域名，并使用 HTTPS 部署。
- `MONGO_RETRY_WRITES` 在单节点 MongoDB 下必须为 `false`，否则写入会失败。
- `.env` 与 `node_modules/` 已被 `.gitignore` 忽略，切勿提交。
