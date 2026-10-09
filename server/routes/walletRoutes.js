import express from 'express';
import {
  getWalletOverview,
  requestWithdrawal,
  getAdminWithdrawals,
  approveWithdrawal,
} from '../controllers/walletController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/overview', protect, getWalletOverview);
router.post('/withdraw', protect, requestWithdrawal);
router.get('/admin/withdrawals', protect, requireRole('admin'), getAdminWithdrawals);
router.put('/admin/withdrawals/:id', protect, requireRole('admin'), approveWithdrawal);

export default router;
