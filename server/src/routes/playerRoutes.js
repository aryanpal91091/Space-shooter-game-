import express from 'express';
import { getProfile, getProgress, getInventory, getHistory } from '../controllers/playerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/profile', getProfile);
router.get('/progress', getProgress);
router.get('/inventory', getInventory);
router.get('/history', getHistory);

export default router;
