import express from 'express';
import { createAdOpportunity, verifyAdEvent, claimAdReward } from '../controllers/adController.js';
import { authenticateToken } from '../middleware/auth.js';
import { economyLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authenticateToken);
router.use(economyLimiter);

router.post('/ad/opportunity', createAdOpportunity);
router.post('/ad/verify', verifyAdEvent);
router.post('/ad/claim', claimAdReward);

export default router;
