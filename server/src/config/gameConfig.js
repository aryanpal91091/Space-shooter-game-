import dotenv from 'dotenv';
dotenv.config();

export const GAME_NAME = process.env.GAME_NAME || 'SPACE SHOOTER ODYSSEY';
export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
export const JWT_SECRET = process.env.JWT_SECRET || 'odyssey_dev_secret_key_2026';
export const MONGODB_URI = process.env.MONGODB_URI || '';
