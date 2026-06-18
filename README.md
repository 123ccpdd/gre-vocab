# 📖 考研英语词汇记忆应用

基于艾宾浩斯记忆曲线的考研英语单词记忆 Web 应用，支持本地学习和云端同步，使用 React + TypeScript + TailwindCSS + Node.js 构建。

## ✨ 核心功能

- **🧠 艾宾浩斯记忆曲线** — 根据科学间隔（1→2→4→7→15→30天）自动推送待复习单词，真正实现高效记忆
- **📝 真题语境例句** — 每个单词配备考研真题例句，标注年份和题型，在真实语境中理解词义
- **🔤 词根词缀分析** — 拆解单词结构（前缀+词根+后缀），理解构词逻辑，举一反三
- **🔥 学习打卡统计** — 每日学习记录、连续打卡天数、正确率追踪，用数据见证进步
- **📚 2000词核心词库** — 内置考研英语核心词汇2000词，按字母分组，支持分类浏览
- **📂 词库导入导出** — 支持 JSON/CSV/TXT 格式的词库导入导出，可自定义词库
- **🔀 随机学习顺序** — 打乱单词顺序，避免机械记忆
- **☁️ 云端同步** — 用户注册登录，学习数据云端存储，多设备同步
- **🔄 数据迁移** — 本地数据一键迁移至云端，无缝切换

## 🛠 技术栈

### 前端
- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式方案**: TailwindCSS 4
- **UI 组件库**: Ant Design 6
- **图标**: @ant-design/icons
- **数据请求**: Axios + @tanstack/react-query
- **路由**: React Router v7

### 后端
- **运行时**: Node.js + Express
- **数据库**: MongoDB (Mongoose ODM)
- **认证**: JWT (accessToken + refreshToken 双令牌机制)
- **密码加密**: bcryptjs
- **参数校验**: Zod
- **部署**: Vercel (前端) + 支持独立后端部署

## 📁 项目结构

```
├── src/                          # 前端源码
│   ├── components/               # UI 组件
│   │   ├── WordCard.tsx              # 单词卡片（翻转、词根、例句）
│   │   ├── Dashboard.tsx             # 首页仪表盘
│   │   ├── LearningSession.tsx       # 学习/复习会话
│   │   ├── CompletionScreen.tsx      # 完成界面
│   │   ├── StatsPanel.tsx            # 统计面板
│   │   ├── CategoryWordList.tsx      # 分类词汇列表
│   │   ├── WordList.tsx              # 全部词汇列表
│   │   └── ImportPanel.tsx           # 导入面板
│   ├── pages/                    # 页面
│   │   ├── LoginPage.tsx             # 登录页
│   │   └── RegisterPage.tsx          # 注册页
│   ├── contexts/                 # React Context
│   │   └── AuthContext.tsx            # 认证状态管理
│   ├── services/                 # API 服务
│   │   ├── api.ts                     # Axios 实例 & 拦截器
│   │   ├── auth.ts                    # 认证接口
│   │   ├── records.ts                 # 学习记录接口
│   │   ├── stats.ts                   # 统计接口
│   │   ├── settings.ts                # 设置接口
│   │   ├── words.ts                   # 词汇接口
│   │   ├── migration.ts               # 数据迁移接口
│   │   └── migrationHelper.ts         # 迁移辅助
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── useStorage.ts              # 本地存储管理
│   │   └── useCustomWords.ts          # 自定义词库管理
│   ├── data/                     # 数据
│   │   └── words/                     # 考研词库（26个字母分文件）
│   │       ├── index.ts               # 词库统一导出
│   │       └── words-a~z.ts           # 按字母分组的词汇数据
│   ├── utils/                    # 工具函数
│   │   ├── spaced-repetition.ts       # 艾宾浩斯记忆曲线算法
│   │   ├── import.ts                  # 词库导入
│   │   └── export.ts                  # 词库导出
│   ├── types/                    # 类型定义
│   │   └── index.ts
│   ├── App.tsx                   # 主应用
│   └── main.tsx                  # 入口文件
│
├── server/                       # 后端源码
│   └── src/
│       ├── app.ts                    # Express 应用配置
│       ├── server.ts                 # 服务器启动入口
│       ├── config/                   # 配置
│       │   └── index.ts                  # 环境变量 & 常量
│       ├── middleware/               # 中间件
│       │   ├── auth.ts                   # JWT 认证中间件
│       │   ├── validate.ts               # Zod 参数校验
│       │   ├── subscription.ts           # 订阅状态检查
│       │   └── errorHandler.ts           # 全局错误处理
│       ├── models/                   # Mongoose 模型
│       │   ├── User.ts                   # 用户模型
│       │   ├── LearningRecord.ts         # 学习记录模型
│       │   ├── DailyStats.ts             # 每日统计模型
│       │   ├── UserSettings.ts           # 用户设置模型
│       │   └── CustomWord.ts             # 自定义词汇模型
│       ├── routes/                   # API 路由
│       │   ├── auth.ts                   # 认证（注册/登录/刷新Token）
│       │   ├── records.ts                # 学习记录
│       │   ├── stats.ts                  # 统计数据
│       │   ├── settings.ts               # 用户设置
│       │   ├── words.ts                   # 词汇查询
│       │   └── migration.ts              # 数据迁移
│       ├── services/                 # 业务逻辑
│       │   ├── recordService.ts          # 记录服务
│       │   └── statsService.ts           # 统计服务
│       └── utils/
│           └── jwt.ts                # JWT 工具函数
│
├── vercel.json                   # Vercel 部署配置（API 代理）
└── vite.config.ts                # Vite 配置（开发代理）
```

## 🚀 快速开始

### 本地开发（纯本地模式，无需后端）

无需后端即可使用，学习数据保存在浏览器 localStorage 中：

```bash
npm install
npm run dev
```

### 本地开发（前后端联机）

如果需要调试云端同步功能，分别启动前端和后端：

```bash
# 终端 1：启动 MongoDB（已装 Docker 的用户）
docker run -d -p 27017:27017 --name gre-mongo mongo:7

# 终端 2：启动后端
cd server
cp .env.example .env
# 编辑 server/.env，用 openssl rand -hex 32 生成两个随机密钥填入：
#   JWT_ACCESS_SECRET=粘贴第一个密钥
#   JWT_REFRESH_SECRET=粘贴第二个密钥
npm install && npm run dev

# 终端 3：启动前端
npm install && npm run dev
```

浏览器打开 http://localhost:5173 即可使用，`/api` 请求自动代理到后端。

---

## 🐳 云服务器部署（Docker）

> 适用于 CentOS / Ubuntu 等云服务器，一条命令启动全部服务。

### 第一步：服务器安装 Docker

SSH 登录服务器后执行：

```bash
# 安装 Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker 并设为开机自启
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker compose version
```

### 第二步：上传项目到服务器

**方式 A：Git 克隆（推荐）**
```bash
sudo yum install -y git
git clone <你的仓库地址> /opt/gre-vocab
cd /opt/gre-vocab
```

**方式 B：本地打包上传**
```bash
# 在你自己的电脑上打包
cd /Users/你/gre-vocab
tar -czf gre-vocab.tar.gz --exclude=node_modules --exclude=.git --exclude=server/node_modules .
scp gre-vocab.tar.gz root@服务器IP:/opt/

# 在服务器上解压
cd /opt && tar -xzf gre-vocab.tar.gz -C gre-vocab
```

### 第三步：配置 JWT 密钥

```bash
cd /opt/gre-vocab/server

# 复制示例配置
cp .env.example .env

# 生成两个随机密钥
echo "JWT_ACCESS_SECRET=$(openssl rand -hex 32)" >> .env
echo "JWT_REFRESH_SECRET=$(openssl rand -hex 32)" >> .env

# 验证 .env 内容
cat .env
# 应该看到 JWT_ACCESS_SECRET=一串64位字符
#             JWT_REFRESH_SECRET=另一串64位字符
```

### 第四步：一键启动

```bash
cd /opt/gre-vocab

# 构建并启动所有容器（MongoDB + 后端 + 前端）
sudo docker compose up -d --build
```

首次构建需要 2-5 分钟（下载镜像 + 编译），看到以下输出说明成功：

```
✔ Container gre-mongodb   Started
✔ Container gre-backend    Started
✔ Container gre-frontend   Started
```

### 第五步：验证 & 访问

```bash
# 检查容器状态（三个都应该 Up）
sudo docker compose ps

# 查看后端日志，确认 MongoDB 连接成功
sudo docker compose logs backend | tail -5
# 应该看到 "Server running on port 3001" 和 "MongoDB connected"
```

浏览器打开 **http://服务器IP** 即可使用，点击「注册」创建账号。

### 日常运维

```bash
# 查看日志
sudo docker compose logs -f            # 全部日志
sudo docker compose logs -f backend    # 只看后端

# 重启服务
sudo docker compose restart

# 更新代码后重新构建
sudo docker compose up -d --build

# 停止所有服务
sudo docker compose down

# 停止并删除数据（⚠️ 会清除 MongoDB 数据）
sudo docker compose down -v

# 防火墙开放 80 端口（CentOS）
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --reload
```

### 常见问题

| 问题 | 解决 |
|------|------|
| 页面打不开 | 检查云服务器安全组是否放行 80 端口 |
| 注册时网络错误 | `docker compose logs backend` 查看后端报错 |
| MongoDB 连接失败 | `docker compose logs mongodb` 确认 MongoDB 已启动 |
| 更新代码后没生效 | 执行 `docker compose up -d --build` 重新构建 |
| 端口 80 被占用 | 修改 `docker-compose.yml` 中前端端口，如 `"8080:80"` |

## 📋 实施进度

### ✅ 第一阶段：项目搭建与基础架构
- [x] Vite + React + TypeScript 初始化
- [x] TailwindCSS 配置
- [x] 数据结构设计（单词、学习记录、复习计划）

### ✅ 第二阶段：核心学习功能
- [x] 单词卡片（翻转查看释义）
- [x] 艾宾浩斯记忆曲线算法（SM-2）
- [x] 学习进度追踪（认识/不认识）
- [x] 本地存储持久化

### ✅ 第三阶段：增强功能
- [x] 真题语境例句（标注年份和题型）
- [x] 词根词缀分析（前缀+词根+后缀拆解）
- [x] 学习打卡（连续天数）
- [x] 统计面板（学习量趋势，支持近7天/近1月切换）
- [x] 分类词汇查看
- [x] 随机学习顺序
- [x] 词库导入导出（JSON/CSV/TXT）
- [x] 词库扩容至 2000 词

### ✅ 第四阶段：后端 & 用户系统
- [x] Node.js + Express + MongoDB 后端
- [x] 用户注册/登录（邮箱+密码）
- [x] JWT 双令牌认证（accessToken + refreshToken）
- [x] 学习数据云端存储
- [x] 本地数据一键迁移至云端
- [x] API 代理配置（Vercel + Vite dev proxy）

### 🔄 第五阶段：体验优化
- [x] 深色模式
- [x] 快捷键支持（空格翻转、1/2 评价、ESC 退出）
- [ ] 学习提醒
- [ ] 响应式布局优化
- [ ] 单词发音（Web Speech API）
- [ ] 完善词库（扩充至 5500 词）

## 🎮 快捷键

| 按键 | 功能 |
|------|------|
| `空格` / `Enter` | 翻转卡片 |
| `1` / `J` | 不认识 |
| `2` / `K` | 认识 |
| `ESC` | 退出学习 |

## 📄 License

MIT
