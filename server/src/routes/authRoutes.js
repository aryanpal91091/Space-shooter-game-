import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

export default router;
