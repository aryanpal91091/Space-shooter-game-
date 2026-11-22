import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/gameConfig.js';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required. No authorization token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ message: 'Invalid session. User record not found.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired or invalid authorization signature.', error: err.message });
  }
};
