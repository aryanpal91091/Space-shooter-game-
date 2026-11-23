/**
 * Centralized Game Configuration Module
 * Single source of truth for dynamic Game Name and API URLs
 */
export const GAME_NAME = import.meta.env.VITE_GAME_NAME || 'SPACE SHOOTER ODYSSEY';
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const GAME_METADATA = {
  version: '1.0.0',
  author: 'VELoop Rewards Developer Assignment',
  genre: '2D Sci-Fi Arcade Action Shooter',
  soundtrack: 'Deep Space Synthwave',
};
