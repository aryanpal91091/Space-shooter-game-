import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import PlayerProfile from '../models/PlayerProfile.js';
import PlayerShip from '../models/PlayerShip.js';
import PlayerInventory from '../models/PlayerInventory.js';
import PlayerMissionProgress from '../models/PlayerMissionProgress.js';
import { JWT_SECRET } from '../config/gameConfig.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Pilot call-sign or email address is already enlisted.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      passwordHash,
    });

    // Initialize baseline player data
    await Wallet.create({ user: user._id, credits: 500, energyCores: 2 });
    await PlayerProfile.create({ user: user._id, level: 1, xp: 0 });
    await PlayerShip.create({ user: user._id, shipId: 'interceptor', unlocked: true });
    await PlayerInventory.create({ user: user._id });
    await PlayerMissionProgress.create({ user: user._id, missionId: 'm-1', unlocked: true });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Enlistment successful. Welcome to Starfleet Command.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. Pilot not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Security clearance denied.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Authorization verified. Welcome back, Commander.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res.status(200).json({ message: 'Session terminated safely.' });
};
