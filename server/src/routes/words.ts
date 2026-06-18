import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { CustomWord } from '../models/CustomWord.js';

const router = Router();

router.use(authMiddleware);

// GET /words/custom
router.get('/custom', async (req: Request, res: Response) => {
  try {
    let doc = await CustomWord.findOne({ userId: req.user!.userId });
    if (!doc) {
      doc = await CustomWord.create({ userId: req.user!.userId, words: [] });
    }
    res.json(doc.words);
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: '获取自定义词库失败' });
  }
});

// POST /words/custom  { words: Word[] }
router.post('/custom', async (req: Request, res: Response) => {
  try {
    const { words } = req.body;
    if (!Array.isArray(words)) {
      res.status(400).json({ error: 'ValidationError', message: 'words 必须是数组' });
      return;
    }

    const doc = await CustomWord.findOneAndUpdate(
      { userId: req.user!.userId },
      { $push: { words: { $each: words } } },
      { upsert: true, new: true }
    );
    res.json({ added: words.length, total: doc!.words.length });
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: '添加自定义词失败' });
  }
});

// DELETE /words/custom/:id
router.delete('/custom/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await CustomWord.updateOne(
      { userId: req.user!.userId },
      { $pull: { words: { id } } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: '删除自定义词失败' });
  }
});

// DELETE /words/custom  (清空全部)
router.delete('/custom', async (req: Request, res: Response) => {
  try {
    await CustomWord.updateOne(
      { userId: req.user!.userId },
      { $set: { words: [] } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: '清空自定义词失败' });
  }
});

export default router;