import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getTodayStats, updateTodayStats, getAllStats, getStreak } from '../services/statsService.js';

const router = Router();

router.use(authMiddleware);

// GET /stats/today
router.get('/today', async (req: Request, res: Response) => {
  try {
    const stats = await getTodayStats(req.user!.userId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: '获取今日统计失败' });
  }
});

// POST /stats/today  { newWords?, reviewWords?, correctRate?, studyTime? }
router.post('/today', async (req: Request, res: Response) => {
  try {
    const update = req.body;
    const stats = await updateTodayStats(req.user!.userId, update);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: '更新今日统计失败' });
  }
});

// GET /stats/streak
router.get('/streak', async (req: Request, res: Response) => {
  try {
    const streak = await getStreak(req.user!.userId);
    res.json({ streak });
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: '获取连续打卡天数失败' });
  }
});

// GET /stats  (所有每日统计)
router.get('/', async (req: Request, res: Response) => {
  try {
    const stats = await getAllStats(req.user!.userId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: '获取统计数据失败' });
  }
});

export default router;