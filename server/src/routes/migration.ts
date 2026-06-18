import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { LearningRecord } from '../models/LearningRecord.js';
import { DailyStats } from '../models/DailyStats.js';
import { UserSettings } from '../models/UserSettings.js';
import { CustomWord } from '../models/CustomWord.js';
import mongoose from 'mongoose';

const router = Router();

router.use(authMiddleware);

// POST /migration/import  { records, dailyStats, settings, customWords }
router.post('/import', async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const { records, dailyStats, settings, customWords } = req.body;

    // 1. 导入学习记录 — bulkWrite upsert
    if (records && typeof records === 'object') {
      const ops = Object.values(records as Record<string, any>).map((r: any) => ({
        updateOne: {
          filter: { userId, wordId: r.wordId },
          update: { $setOnInsert: { userId, wordId: r.wordId }, $set: { ...r, userId } },
          upsert: true,
        } as any,
      }));
      if (ops.length > 0) {
        await LearningRecord.bulkWrite(ops);
      }
    }

    // 2. 导入每日统计 — bulkWrite upsert（同天合并取较大值）
    if (Array.isArray(dailyStats)) {
      const ops = dailyStats.map((s: any) => ({
        updateOne: {
          filter: { userId, date: s.date },
          update: {
            $setOnInsert: { userId, date: s.date },
            $max: {
              newWords: s.newWords || 0,
              reviewWords: s.reviewWords || 0,
            },
          },
          upsert: true,
        } as any,
      }));
      if (ops.length > 0) {
        await DailyStats.bulkWrite(ops);
      }
    }

    // 3. 导入设置 — upsert 整体覆盖
    if (settings && typeof settings === 'object') {
      await UserSettings.findOneAndUpdate(
        { userId },
        { $set: { ...settings, userId } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // 4. 导入自定义词 — upsert 追加
    if (Array.isArray(customWords) && customWords.length > 0) {
      await CustomWord.findOneAndUpdate(
        { userId },
        { $push: { words: { $each: customWords } } },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, message: '数据迁移成功' });
  } catch (err: any) {
    console.error('Migration error:', err);
    res.status(500).json({ error: 'InternalServerError', message: '数据迁移失败: ' + err.message });
  }
});

export default router;