import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per window
  message: { message: 'Too many authentication attempts. Please standby for 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const economyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: { message: 'Economy transaction throughput threshold reached. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 180,
  standardHeaders: true,
  legacyHeaders: false,
});
