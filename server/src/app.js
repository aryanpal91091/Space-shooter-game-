import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { GAME_NAME, CLIENT_URL, NODE_ENV } from './config/gameConfig.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import shipRoutes from './routes/shipRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import powerupRoutes from './routes/powerupRoutes.js';
import economyRoutes from './routes/economyRoutes.js';
import adRoutes from './routes/adRoutes.js';
import engagementRoutes from './routes/engagementRoutes.js';

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration
app.use(cors({
  origin: CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    gameName: GAME_NAME,
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/ships', shipRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/powerups', powerupRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/wallet', economyRoutes);
app.use('/api/economy', economyRoutes);
app.use('/api/rewards', adRoutes);
app.use('/api', engagementRoutes);

// Error Handler
app.use(errorHandler);

export default app;
