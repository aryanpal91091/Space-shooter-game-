import PlayerProfile from '../models/PlayerProfile.js';
import PlayerMissionProgress from '../models/PlayerMissionProgress.js';
import PlayerInventory from '../models/PlayerInventory.js';
import GameSession from '../models/GameSession.js';

export const getProfile = async (req, res, next) => {
  try {
    let profile = await PlayerProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await PlayerProfile.create({ user: req.user._id });
    }
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

export const getProgress = async (req, res, next) => {
  try {
    const records = await PlayerMissionProgress.find({ user: req.user._id });
    const profile = await PlayerProfile.findOne({ user: req.user._id });

    const unlockedMissions = records.filter(r => r.unlocked).map(r => r.missionId);
    if (!unlockedMissions.includes('m-1')) unlockedMissions.push('m-1');

    const completedMissions = {};
    records.filter(r => r.completed).forEach(r => {
      completedMissions[r.missionId] = {
        stars: r.stars,
        bestScore: r.bestScore,
        completedAt: r.completedAt,
      };
    });

    res.status(200).json({
      unlockedMissions,
      completedMissions,
      dailyStreak: profile?.dailyStreak || 1,
    });
  } catch (err) {
    next(err);
  }
};

export const getInventory = async (req, res, next) => {
  try {
    let inv = await PlayerInventory.findOne({ user: req.user._id });
    if (!inv) {
      inv = await PlayerInventory.create({ user: req.user._id });
    }
    res.status(200).json(inv.powerups);
  } catch (err) {
    next(err);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const history = await GameSession.find({ user: req.user._id })
      .sort({ startTime: -1 })
      .limit(20);
    res.status(200).json({ history });
  } catch (err) {
    next(err);
  }
};
