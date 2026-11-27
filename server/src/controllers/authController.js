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

    // Support seamless migration from Guest Mode
    const startingCredits = Math.max(500, Number(req.body.guestWallet?.credits) || 500);
    const startingEnergy = Math.max(2, Number(req.body.guestWallet?.energyCores) || 2);
    const startingXP = Math.max(0, Number(req.body.guestWallet?.xp) || 0);
    const startingLevel = Math.max(1, Number(req.body.guestWallet?.level) || 1);

    // Initialize baseline player data with guest progression carried over
    await Wallet.create({ user: user._id, credits: startingCredits, energyCores: startingEnergy });
    await PlayerProfile.create({ user: user._id, level: startingLevel, xp: startingXP });
    
    // Unlock ships (interceptor + any unlocked as guest)
    const shipsToUnlock = Array.isArray(req.body.guestFleet?.unlockedShips) 
      ? [...new Set(['interceptor', ...req.body.guestFleet.unlockedShips])]
      : ['interceptor'];
    for (const sid of shipsToUnlock) {
      await PlayerShip.create({ user: user._id, shipId: sid, unlocked: true });
    }

    await PlayerInventory.create({ user: user._id });

    // Unlock missions (m-1 + any unlocked as guest)
    const missionsToUnlock = Array.isArray(req.body.guestProgress?.unlockedMissions)
      ? [...new Set(['m-1', ...req.body.guestProgress.unlockedMissions])]
      : ['m-1'];
    for (const mid of missionsToUnlock) {
      await PlayerMissionProgress.create({ user: user._id, missionId: mid, unlocked: true });
    }

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

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Pilot communications email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message: 'If an enlisted pilot account exists for this communication channel, a recovery code has been transmitted.',
      });
    }

    // Generate 6-digit recovery code
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = recoveryCode;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    res.status(200).json({
      message: 'Emergency clearance recovery code generated and dispatched.',
      recoveryCode, // Sent for immediate testing / demo environment
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, recovery code, and new clearance code are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New clearance code must be at least 6 characters.' });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired clearance recovery code.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      message: 'Clearance code successfully updated. Proceed to authentication terminal.',
    });
  } catch (err) {
    next(err);
  }
};
