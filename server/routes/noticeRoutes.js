import express from 'express';
import { getNotices, createNotice } from '../controllers/noticeController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getNotices);
router.post('/', protect, requireRole('admin'), createNotice);

export default router;
