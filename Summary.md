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


## 注册登录优化方案

> 当前认证系统为简易版：邮箱+密码注册、JWT 双令牌、localStorage 存储 refreshToken。
> 以下按优先级排列，建议逐步实施。

### 当前问题

| 问题 | 位置 | 风险 |
|------|------|------|
| 密码仅 6 位，无强度校验 | `auth.ts` registerSchema + `RegisterPage.tsx` | 🔴 高 |
| refreshToken 存 localStorage，XSS 可窃取 | `api.ts` + `AuthContext.tsx` | 🔴 高 |
| 无登录限速，可暴力破解 | `auth.ts` POST /login | 🔴 高 |
| refreshToken 无服务端记录，无法吊销 | `jwt.ts` verifyRefreshToken 仅验签名 | 🟡 中 |
| 无邮箱验证 | `auth.ts` POST /register | 🟡 中 |
| 无密码重置 | 缺失 | 🟡 中 |
| 登录/注册页无深色模式 | `LoginPage.tsx` / `RegisterPage.tsx` | 🟢 低（已修复） |

### P0：安全底线（2-3天）

1. **密码策略强化**
   - 后端 Zod schema 改为 min(8) + 大写 + 小写 + 数字 + 特殊字符正则
   - 前端加实时强度指示器 + 确认密码字段

2. **登录限速**
   - `express-rate-limit`：注册 15min/10次，登录 5min/5次失败
   - 新文件 `server/src/middleware/rateLimiter.ts`

3. **refreshToken 迁移 HttpOnly Cookie**
   - 后端登录/注册改用 `res.cookie()` 设置 httpOnly+secure+sameSite
   - refresh 接口从 `req.cookies` 读取
   - 前端 Axios 加 `withCredentials: true`，删掉 localStorage 读写 refreshToken 逻辑

### P1：邮箱验证 + 密码重置（2-3天）

4. **邮箱验证**
   - User 模型加 `isEmailVerified` / `emailVerificationToken` / `emailVerificationExpires`
   - 注册后发验证邮件（Nodemailer + QQ邮箱 SMTP）
   - 未验证用户限制迁移数据
   - 新增 `/verify-email` + `/resend-verification` 接口

5. **密码重置**
   - User 模型加 `passwordResetToken` / `passwordResetExpires`
   - 新增 `/forgot-password` + `/reset-password` 接口
   - 重置后吊销所有 session
   - 前端新增 `ForgotPasswordPage.tsx`

### P2：设备管理 + Session（2天）

6. **Session 模型**
   - 新增 `server/src/models/Session.ts`（userId, refreshTokenHash, device, ip, createdAt, expiresAt）
   - refresh 时轮转 session，检测重放攻击
   - 新增 `/sessions` 查询和删除接口，支持「在其他设备上退出登录」

### P3：第三方登录（3-5天）

7. **微信扫码登录** — 微信开放平台 OAuth2，需 AppID + AppSecret
8. **GitHub/Google OAuth**（可选）— passport.js 简化实现 + 绑定/解绑逻辑

### P4：前端体验（1-2天）

9. ~~登录/注册页深色模式~~ ✅ 已修复
10. **注册后自动登录** — 当前已基本可用，确认 ProtectedRoute 不拦截
11. **「记住我」选项** — 勾选延长 refreshToken 至 30 天
12. **Token 主动刷新** — accessToken 过期前 5 分钟主动刷新，避免操作中断

---

## 未完成功能

- [ ] 学习提醒
- [ ] 响应式布局优化
- [ ] 单词发音（Web Speech API）
- [ ] 词库扩充至 5500 词
- [ ] 服务器部署验证通过
