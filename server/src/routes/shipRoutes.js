import express from 'express';
import { getShipCatalog, getOwnedShips, selectShip, unlockShip, upgradeShip } from '../controllers/shipController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public catalog access
router.get('/', getShipCatalog);

router.use(authenticateToken);

router.get('/owned', getOwnedShips);
router.post('/:shipId/select', selectShip);
router.post('/:shipId/unlock', unlockShip);
router.post('/:shipId/upgrade', upgradeShip);

export default router;
