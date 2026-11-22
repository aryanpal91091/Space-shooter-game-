import express from 'express';
import { getPowerups, acquirePowerup } from '../controllers/powerupController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPowerups);
router.post('/:powerUpId/acquire', authenticateToken, acquirePowerup);

export default router;
