import express from 'express';
import {
  getEconomyConfig,
  getWalletBalance,
  getWalletHistory,
  getRewardHistory,
} from '../controllers/economyController.js';
import { authenticateToken } from '../middleware/auth.js';
import { economyLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/config', getEconomyConfig);

router.get('/balance', authenticateToken, getWalletBalance);
router.get('/history', authenticateToken, economyLimiter, getWalletHistory);
router.get('/rewards/history', authenticateToken, economyLimiter, getRewardHistory);

export default router;
