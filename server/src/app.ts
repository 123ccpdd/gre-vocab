import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { config } from './config/index.js';
import authRoutes from './routes/auth.js';
import recordRoutes from './routes/records.js';
import statsRoutes from './routes/stats.js';
import settingsRoutes from './routes/settings.js';
import wordRoutes from './routes/words.js';
import migrationRoutes from './routes/migration.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// 中间件
app.use(cors({
  origin: config.nodeEnv === 'development'
    ? 'http://localhost:5173'
    : process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/migration', migrationRoutes);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use(errorHandler);

// MongoDB 连接
export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri);
    console.log(`MongoDB 已连接: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('MongoDB 连接失败:', err);
    process.exit(1);
  }
}

export default app;