import express from 'express';
import {
  getLeaderboard,
  claimDailyLogin,
  getDailyMissions,
  claimDailyMission,
  getAchievements,
  getEvents,
  getEventProgress,
} from '../controllers/engagementController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/achievements', getAchievements);
router.get('/events', getEvents);
router.get('/events/:eventId/progress', authenticateToken, getEventProgress);
router.get('/daily-missions', getDailyMissions);

router.post('/daily-login/claim', authenticateToken, claimDailyLogin);
router.post('/daily-missions/:missionId/claim', authenticateToken, claimDailyMission);

export default router;
