import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { markWord, getDueWords, getStats, getAllRecords, getRecordsByStatus } from '../services/recordService.js';

// 词库总数（与前端保持同步，后续可从配置或数据库读取）
const TOTAL_WORD_COUNT = 1750;

const router = Router();

// 所有路由需认证
router.use(authMiddleware);

// POST /records/mark  { wordId, isCorrect }
router.post('/mark', async (req: Request, res: Response) => {
  try {
    const { wordId, isCorrect } = req.body;
    if (!wordId || typeof isCorrect !== 'boolean') {
      res.status(400).json({ error: 'ValidationError', message: '缺少 wordId 或 isCorrect' });
      return;
    }
    const record = await markWord(req.user!.userId, wordId, isCorrect);
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: '更新学习记录失败' });
  }
});

// GET /records/due
router.get('/due', async (req: Request, res: Response) => {
  try {
    const wordIds = await getDueWords(req.user!.userId);
    res.json(wordIds);
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: '获取待复习单词失败' });
  }
});

// GET /records/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getStats(req.user!.userId, TOTAL_WORD_COUNT);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: '获取统计失败' });
  }
});

// GET /records  ?status=learning
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const records = status
      ? await getRecordsByStatus(req.user!.userId, status as string)
      : await getAllRecords(req.user!.userId);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: '获取学习记录失败' });
  }
});

export default router;