import express from 'express';
import { getMissions, getMissionById } from '../controllers/gameController.js';

const router = express.Router();

router.get('/', getMissions);
router.get('/:missionId', getMissionById);

export default router;
