import express from 'express';
import {
  createParticipant,
  listParticipants,
  updateParticipant,
  deleteParticipant
} from '../repositories/participants.js';

const router = express.Router();

// POST /api/signup - 建立報名
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }
    const id = await createParticipant({ name, email, phone });
    res.status(201).json({ id, message: '報名成功' });
  } catch (error) {
    if (error.message === '此 Email 已被使用') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// GET /api/signup - 取得報名清單（支援分頁）
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await listParticipants({ page, limit });
    res.json({
      participants: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/signup/:id - 更新報名
router.patch('/:id', async (req, res, next) => {
  try {
    const result = await updateParticipant(req.params.id, req.body);
    if (!result.matchedCount) {
      return res.status(404).json({ error: '找不到資料' });
    }
    res.json({ message: '更新成功', updated: result.modifiedCount });
  } catch (error) {
    if (error.message === '此 Email 已被使用') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/signup/:id - 刪除報名
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteParticipant(req.params.id);
    if (!result.deletedCount) {
      return res.status(404).json({ error: '找不到資料' });
    }
    res.json({ message: '刪除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;