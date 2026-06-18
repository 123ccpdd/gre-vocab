import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// 校验 schema
const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6个字符').max(50, '密码最多50个字符'),
  nickname: z.string().max(30, '昵称最多30个字符').optional(),
});

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '请输入密码'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, '缺少刷新令牌'),
});

// POST /auth/register
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, nickname } = req.body;

    // 检查邮箱是否已注册
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ error: 'Conflict', message: '该邮箱已注册' });
      return;
    }

    // 密码哈希
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await User.create({
      email,
      password: hashedPassword,
      nickname: nickname || '',
    });

    // 生成 token
    const payload = { userId: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(201).json({
      user: { id: user._id, email: user.email, nickname: user.nickname },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: '注册失败' });
  }
});

// POST /auth/login
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Unauthorized', message: '邮箱或密码错误' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Unauthorized', message: '邮箱或密码错误' });
      return;
    }

    const payload = { userId: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      user: { id: user._id, email: user.email, nickname: user.nickname },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: '登录失败' });
  }
});

// POST /auth/refresh
router.post('/refresh', validate(refreshSchema), async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const payload = verifyRefreshToken(refreshToken);

    // 验证用户仍存在
    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized', message: '用户不存在' });
      return;
    }

    const newPayload = { userId: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch {
    res.status(401).json({ error: 'Unauthorized', message: '刷新令牌无效或已过期' });
  }
});

// GET /auth/me (需认证)
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select('-password');
    if (!user) {
      res.status(404).json({ error: 'NotFound', message: '用户不存在' });
      return;
    }
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'InternalServerError', message: '获取用户信息失败' });
  }
});

export default router;