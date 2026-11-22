import express from 'express';
import {
  startGame,
  completeGame,
  claimSessionReward,
  usePowerupInSession,
  getGameHistory,
} from '../controllers/gameController.js';
import {
  requestRevive,
  verifyRevive,
  requestDoubleScore,
  verifyDoubleScore,
  requestDoubleCredits,
  verifyDoubleCredits,
} from '../controllers/adController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/start', startGame);
router.post('/:sessionId/complete', completeGame);
router.post('/:sessionId/claim', claimSessionReward);
router.post('/:sessionId/powerups/use', usePowerupInSession);
router.get('/history', getGameHistory);

// Specific game session ad shortcuts as required by spec Section 30
router.post('/:sessionId/revive/request', requestRevive);
router.post('/:sessionId/revive/verify', verifyRevive);
router.post('/:sessionId/double-score/request', requestDoubleScore);
router.post('/:sessionId/double-score/verify', verifyDoubleScore);
router.post('/:sessionId/double-credits/request', requestDoubleCredits);
router.post('/:sessionId/double-credits/verify', verifyDoubleCredits);

export default router;
