# 时光遗嘱 · 数字财产与遗言信标

> 专业数字遗产与财产托付平台。支持银行卡、保险、债权债务、藏匿物品位置、数字账号与深情遗言的结构化引导录入，具备**服务器防篡改时间锁**与**双重密码保护**，立嘱人可随时凭管理密钥修改与撤回。

前后端已彻底分离：`frontend/` 为 React 单页应用，`backend/` 为 Node.js + Express + MongoDB 服务，数据不再落在本地 JSON 文件中。

---

## 目录结构

```
yiyan/
├── README.md               # 项目总说明（当前文件）
├── package.json            # 根级脚本：一键安装 / 一键启动前后端
├── .gitignore
├── frontend/               # 前端（React 19 + Vite 8 + Tailwind CSS 4）
│   ├── index.html
│   ├── vite.config.ts      # 含 /api 开发代理
│   ├── tsconfig.json
│   ├── metadata.json
│   ├── package.json
│   └── src/
│       ├── App.tsx
│       ├── components/     # 立嘱向导、解锁门户、管理面板、引导说明等
│       ├── data/           # 静态清单文案
│       ├── types/          # 共享类型定义
│       └── utils/api.ts    # 接口封装
└── backend/                # 后端（Node.js 16.9.0 + Express + MongoDB）
    ├── .env.example
    ├── package.json
    ├── scripts/seed.js     # 演示数据导入
    └── src/
        ├── index.js        # 入口：连接数据库、监听端口、优雅退出
        ├── app.js          # Express 装配（中间件 / 静态托管 / 错误处理）
        ├── db.js           # MongoDB 连接管理
        ├── config/         # 环境变量配置
        ├── models/         # 集合访问与索引
        ├── routes/         # /api 路由
        ├── seed/           # 演示数据
        └── utils/
```

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · lucide-react · motion |
| 后端 | Node.js 16.9.0 · Express 4 · MongoDB 官方驱动 4.x · cors · dotenv |
| 数据库 | MongoDB（集合 `capsules`，数据库名默认 `yiyan_testament`） |

> **版本说明**：后端按 Node.js **16.9.0** 编写（未使用 Node 18+ 的全局 `fetch`、`node --watch` 等特性，热重载改用 `nodemon`）；前端依赖 Vite 8，自身要求 Node.js `^20.19.0 || >=22.12.0`。两者版本互不影响，可用不同版本的 Node 分别运行。

---

## 环境要求

| 组件 | 版本 | 用途 |
| --- | --- | --- |
| Node.js | 后端 `>=16.9.0`；前端 `^20.19.0 || >=22.12.0` | 运行时 |
| npm | 随 Node 附带 | 包管理 |
| MongoDB | `>=4.4` | 数据存储（本地单机或 Atlas 均可） |

---

## 快速开始

### 1. 启动 MongoDB

任选其一：

- **本地安装**：安装后执行 `mongod --dbpath <数据目录>`，默认监听 `127.0.0.1:27017`
- **Docker**：`docker run -d --name yiyan-mongo -p 27017:27017 -v yiyan-data:/data/db mongo:6`
- **MongoDB Atlas**：使用官方提供的 `mongodb+srv://...` 连接串

### 2. 安装依赖

分别安装（或在根目录执行一键安装）：

```bash
# 根目录一键安装（前端 + 后端）
npm install          # 安装 concurrently 等根级工具
npm run install:all  # 安装 backend 与 frontend 的依赖
```

> **提示**：部分 npm 版本（如 10.8.x）在解析 Vite 8 的可选 peer 依赖时会报 `Cannot read properties of null (reading 'edgesOut')`。此时改用 `npm install --legacy-peer-deps` 即可，属 npm 自身的已知缺陷，与项目代码无关。

### 3. 配置后端环境变量

```bash
cd backend
cp .env.example .env
```

按本机情况修改 `backend/.env`：

```ini
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=yiyan_testament
CORS_ORIGIN=http://localhost:5173
FRONTEND_DIST=../frontend/dist
```

### 4. 导入演示数据（可选）

```bash
cd backend
npm run seed
```

脚本幂等，可重复执行；会写入两个演示信标：

| 信标编号 | 状态 | 测试密码 |
| --- | --- | --- |
| `DEMO-READY-2026` | 已到开启时间，可直接解锁 | `123456` |
| `TIME-LOCKED-DEMO` | 一年后才开启，用于验证时间锁 | `demo2026` |

### 5. 启动后端

```bash
cd backend
npm run dev     # 开发模式（nodemon 热重载）
# 或
npm start       # 生产模式
```

看到 `[db] 已连接 MongoDB` 即表示连接成功。

### 6. 启动前端

```bash
cd frontend
npm install
npm run dev
```

浏览器访问 <http://localhost:5173>。开发环境下 Vite 会把 `/api` 请求代理到 `http://localhost:4000`，无需处理跨域。

### 7.（可选）根目录一键启动

```bash
npm install
npm run dev
```

同时拉起前后端两个进程（`concurrently`）。

---

## 生产部署

单进程即可对外提供服务：

```bash
# 1. 构建前端
cd frontend && npm run build        # 产物在 frontend/dist

# 2. 以生产模式启动后端（自动托管 frontend/dist）
cd ../backend
NODE_ENV=production npm start
```

访问 `http://localhost:4000` 即可获得完整应用（前端页面 + `/api` 接口）。

配合 Nginx / 云负载均衡时，只需把流量指向后端端口，并保证 `FRONTEND_DIST` 指向真实的构建产物目录。

---

## 接口速查

前缀 `/api`，完整说明见 [`backend/README.md`](backend/README.md)。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/health` | 健康检查 |
| `GET` | `/api/time` | 服务器权威时间 |
| `GET` | `/api/capsules` | 信标公开列表 |
| `GET` | `/api/capsules/:id` | 单个信标公开信息 |
| `POST` | `/api/capsules/:id/unlock` | 接收者密码解锁 |
| `POST` | `/api/capsules` | 创建信标（返回 `id` + `adminKey`） |
| `POST` | `/api/capsules/:id/verify-admin` | 管理密钥校验并读取完整信标 |
| `PUT` | `/api/capsules/:id` | 更新信标 |
| `DELETE` | `/api/capsules/:id` | 撤回销毁信标 |

---

## 核心机制

- **服务器时间锁**：解锁判定一律使用后端 `Date.now()`，前端无法通过改系统时间绕过。
- **双重密码**：接收者凭 `password` 解锁；立嘱人凭 `adminKey` 编辑或撤回信标，二者互不通用。
- **信标编号可读**：形如 `TST-K7QM-4821`，便于线下告知；查询时忽略大小写。
- **公开信息脱敏**：列表与详情接口只返回标题、收信人、时间与密码提示，不返回密码、管理密钥与遗言正文。

---

## 常见问题

**Q：前端提示「无法连接到服务器时间服务」？**
A：后端未启动或 MongoDB 未连接。后端启动失败时会打印 `[server] 启动失败`，请检查 `backend/.env` 中的 `MONGODB_URI` 与 MongoDB 服务状态。

**Q：`npm install` 报 `Cannot read properties of null (reading 'edgesOut')`？**
A：npm 10.8.x 解析 Vite 8 可选 peer 依赖时的已知缺陷，改用 `npm install --legacy-peer-deps` 安装即可。

**Q：`npm run build` 报 `Cannot find module './rolldown-binding.win32-x64-msvc.node'`？**
A：npm 未安装平台相关的可选二进制包。手动补装即可：
`npm i -D @rolldown/binding-win32-x64-msvc`（其他系统换成对应平台包）。

**Q：`npm run seed` 报连接超时？**
A：确认 `mongod` 正在运行且端口与 `MONGODB_URI` 一致；本机装了 MongoDB 但未启动服务是最常见原因。

**Q：写入时报 `Transaction numbers are only allowed on a replica set member or mongos`？**
A：单节点 MongoDB 不支持可重试写入，请把 `MONGO_RETRY_WRITES` 保持为 `false`（默认值）。

**Q：接口跨域报错？**
A：设置 `CORS_ORIGIN` 为前端的实际地址（多个用逗号分隔），或使用 Vite 代理（开发环境默认已代理）。

**Q：后端提示找不到前端页面？**
A：未执行 `npm run build`，或 `FRONTEND_DIST` 路径不对。该路径相对 `backend/` 目录解析，默认 `../frontend/dist`。

---

## 安全提示

- 当前访问密码与管理密钥以**明文**存储于数据库（沿用原实现），**正式上线前请改为哈希存储**（如 bcrypt）并改用环境变量注入。
- 生产环境请设置具体的 `CORS_ORIGIN`、启用 HTTPS，并使用具备认证的 MongoDB 连接串。
- `backend/.env`、`frontend/.env`、`node_modules/` 均已被 `.gitignore` 忽略，请勿提交。

---

## 许可

仅供个人学习与内部使用。涉及真实遗产信息时，请自行评估合规与隐私要求。
