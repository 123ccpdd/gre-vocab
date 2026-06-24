# 项目任务概要

> 最后更新：2026-06-18

## 项目简介

考研英语词汇记忆 Web 应用，基于艾宾浩斯记忆曲线。前端 React + TypeScript + TailwindCSS，后端 Node.js + Express + MongoDB。

---

## 当前状态

### ✅ 已完成

- **词库扩容至 2000 词**（原 1750 词，新增 250 词，id 2025-2274）
- **后端 API 完整实现**：注册/登录/学习记录/统计/设置/词汇查询/数据迁移
- **JWT 双令牌认证**：accessToken + refreshToken，自动刷新
- **Docker 部署配置**：前端(Nginx) + 后端(Node) + MongoDB 三容器编排
- **本地模式可用**：无需后端，数据存 localStorage

### 🔧 服务器部署进行中

- 服务器已买，CentOS，Docker 已装
- 首次 `docker compose up` 遇到两个问题（已修复，需重新上传代码）：
  1. **npm ci 报错** → Dockerfile 改为 `npm install`
  2. **词库 roots 类型错误** → 477 处 `type` 和 `part` 值写反，已修复
- 最新打包：`~/Documents/gre-vocab.tar.gz`

### 待在服务器执行

```bash
# 上传新包后
cd /opt/gre-vocab
rm -rf *
tar -xzf gre-vocab.tar.gz
cp server/.env .env   # JWT 密钥给 docker compose 用
docker compose up -d --build
```

---

## 关键文件速查

| 文件 | 说明 |
|------|------|
| `src/data/words/words-a~z.ts` | 词库（2000词，按字母分文件） |
| `src/data/words/index.ts` | 词库统一导出 |
| `src/types/index.ts` | TypeScript 类型定义（Word, WordRoot, Example 等） |
| `src/contexts/AuthContext.tsx` | 前端认证状态管理 |
| `src/services/api.ts` | Axios 实例 + token 拦截器 |
| `server/src/routes/auth.ts` | 注册/登录/刷新 Token 接口 |
| `server/src/config/index.ts` | 后端配置（端口/MongoDB/JWT/CORS） |
| `server/.env.example` | 后端环境变量模板 |
| `docker-compose.yml` | 三容器编排 |
| `Dockerfile` | 前端容器（vite build + nginx） |
| `server/Dockerfile` | 后端容器（tsc + node） |
| `nginx.conf` | Nginx 配置（SPA fallback + /api 反代） |

---

## 注意事项

### 词库统计方法
- ✅ 正确：`grep -cE "^\s+id:\s*['\"]" words-*.ts`
- ❌ 错误：`grep "{" words-*.ts`（嵌套花括号导致重复计数）

### ID 分配规则
- 按插入时间递增，从当前最大 id+1 开始
- 不要重排已有 id（会破坏用户学习记录）

### 例句引号规则
- 例句含撇号（didn't, it's, team's）必须用**双引号**包裹：`sentence: "..."`
- 中文翻译含单引号也用双引号：`translation: "..."`

### docker compose 的 .env
- `docker compose` 读取的是**项目根目录的 `.env`**，不是 `server/.env`
- 所以需要 `cp server/.env .env` 到根目录

---


## 未完成功能

- [ ] 学习提醒
- [ ] 响应式布局优化
- [ ] 单词发音（Web Speech API）
- [ ] 词库扩充至 5500 词
- [ ] 服务器部署验证通过
