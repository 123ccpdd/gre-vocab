# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

考研英语词汇记忆应用 — A GRE/postgrad English vocabulary app built with React + Express + MongoDB. Uses Ebbinghaus spaced repetition (1→2→4→7→15→30 day intervals) to schedule reviews. Supports both offline (localStorage) and cloud (authenticated API) modes.

## Commands

```bash
# Frontend (root directory)
npm run dev          # Vite dev server on :5173, proxies /api → :3001
npm run build        # tsc + vite build
npm run lint         # ESLint
npm run preview      # Preview production build

# Backend (server/ directory)
cd server
npm run dev          # tsx watch on :3001
npm run build        # tsc → dist/
npm run start        # node dist/server.js (production)

# Full-stack local dev (3 terminals)
docker run -d -p 27017:27017 --name gre-mongo mongo:7   # Terminal 1: MongoDB
cd server && npm run dev                                  # Terminal 2: Backend
npm run dev                                               # Terminal 3: Frontend

# Docker deployment
docker compose up -d --build    # Build & start all 3 services (mongo + backend + frontend)
```

No test framework is configured.

## Architecture

### Dual Storage Model

The app works without a backend — learning data persists in localStorage via `useStorage` hooks. When a user registers/logs in, data can be migrated to MongoDB via the migration flow (`AuthContext` → `migrationHelper` → `/api/migration`).

- **Offline path**: `useLearningRecords` / `useDailyStats` / `useSettings` hooks read/write `gre-vocab-*` keys in localStorage
- **Online path**: Axios calls to `/api/*` with JWT auth; `AuthContext` manages access/refresh token lifecycle

### Frontend (src/)

- **Routing**: React Router v7. `/login` and `/register` are public; everything else is wrapped in `ProtectedRoute`
- **MainApp** (in App.tsx) manages learning session state with `activeView` (home/learn/review/complete/category) — not URL-driven, uses internal state
- **Spaced repetition**: `src/utils/spaced-repetition.ts` implements the Ebbinghaus algorithm. Answering wrong resets `correctCount` to 0; correctCount ≥ 6 = mastered
- **Word data**: 2000 words split across `src/data/words/words-{a..y}.ts`, unified via `index.ts`
- **Dark mode**: TailwindCSS v4 with `@custom-variant dark` — toggled by adding/removing `dark` class on `<html>`
- **API client**: `src/services/api.ts` — Axios instance with automatic token refresh on 401 (queue-based pattern)

### Backend (server/)

- **Entry**: `server/src/server.ts` → connects MongoDB, starts Express
- **Config**: `server/src/config/index.ts` reads from `.env` (PORT, MONGODB_URI, JWT secrets)
- **Auth flow**: JWT dual-token — accessToken (15m, in-memory) + refreshToken (7d, localStorage `gre-vocab-refresh-token`)
- **Models**: User, LearningRecord, DailyStats, UserSettings, CustomWord (Mongoose)
- **Routes**: All under `/api/` prefix — auth, records, stats, settings, words, migration
- **Middleware**: `auth.ts` (JWT verification), `validate.ts` (Zod schemas), `errorHandler.ts`

### Deployment

- **Vercel**: `vercel.json` rewrites `/api/*` → backend and SPA fallback
- **Docker**: `docker-compose.yml` — 3 services (mongo, backend, frontend with nginx) on an internal `gre-network`; only frontend exposes port 80
- **nginx**: `nginx.conf` serves the SPA and proxies `/api` to the backend container

## Key Conventions

- All API routes are prefixed with `/api/`
- Frontend uses `VITE_API_URL` env var (defaults to `/api`) — set in `.env.local` for custom backends
- Server `.env` requires `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (generate with `openssl rand -hex 32`)
- Word count stats: use `getAllWords().length` or count records — never grep/regex the word data files (nested objects cause false positives)
- MongoDB `bulkWrite`: `$setOnInsert` and `$set` must not share field names (causes conflict)
- TailwindCSS v4: dark mode requires `@custom-variant dark (&:where(.dark, .dark *))` — no `darkMode` config key exists in v4
