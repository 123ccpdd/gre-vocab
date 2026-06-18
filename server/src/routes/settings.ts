import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { UserSettings } from '../models/UserSettings.js';

const router = Router();

router.use(authMiddleware);

// GET /settings
router.get('/', async (req: Request, res: Response) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.user!.userId });
    if (!settings) {
      settings = await UserSettings.create({ userId: req.user!.userId });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: '获取设置失败' });
  }
});

// PUT /settings
router.put('/', async (req: Request, res: Response) => {
  try {
    const allowedFields = ['dailyNewWords', 'dailyReviewLimit', 'enableSound', 'enableDarkMode', 'autoPlayPronunciation'];
    const update: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }

    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user!.userId },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: '更新设置失败' });
  }
});

export default router;