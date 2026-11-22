import LeaderboardEntry from '../models/LeaderboardEntry.js';
import DailyClaim from '../models/DailyClaim.js';
import PlayerProfile from '../models/PlayerProfile.js';
import { WalletService } from '../services/economy/walletService.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const entries = await LeaderboardEntry.find()
      .sort({ score: -1 })
      .limit(50);

    const formatted = entries.map((e, idx) => ({
      rank: idx + 1,
      username: e.username,
      score: e.score,
      missionsCompleted: e.missionsCompleted,
      ship: e.ship,
      verifiedAt: e.verifiedAt,
    }));

    res.status(200).json({ leaderboard: formatted });
  } catch (err) {
    next(err);
  }
};

export const claimDailyLogin = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const existing = await DailyClaim.findOne({ user: req.user._id, claimDate: today });

    if (existing) {
      return res.status(400).json({ message: 'Daily orbital stipend already claimed for today.' });
    }

    let profile = await PlayerProfile.findOne({ user: req.user._id });
    if (!profile) profile = new PlayerProfile({ user: req.user._id });

    const streak = profile.dailyStreak || 1;
    const baseReward = 150 + streak * 50;

    await DailyClaim.create({
      user: req.user._id,
      claimDate: today,
      streakDay: streak,
      reward: { credits: baseReward, xp: 50 },
    });

    profile.dailyStreak = (streak % 7) + 1;
    profile.lastLoginDate = new Date();
    await profile.save();

    const creditRes = await WalletService.credit(
      req.user._id,
      baseReward,
      'DAILY_BONUS',
      `DAILY_STREAK_DAY_${streak}`
    );

    res.status(200).json({
      message: `Claimed Day ${streak} reward: +${baseReward} Credits!`,
      wallet: creditRes.wallet,
      streak: profile.dailyStreak,
    });
  } catch (err) {
    next(err);
  }
};

export const getDailyMissions = (req, res) => {
  res.status(200).json({
    missions: [
      { id: 'daily_kill_30', title: 'Void Exterminator', target: 30, reward: { credits: 250, xp: 120 } },
      { id: 'daily_clear_2', title: 'Fleet Deployments', target: 2, reward: { credits: 300, xp: 150 } },
      { id: 'daily_kill_elite', title: 'High-Value Target', target: 1, reward: { credits: 350, xp: 180, energyCores: 1 } },
      { id: 'daily_powerup_3', title: 'Tactical Overload', target: 3, reward: { credits: 200, xp: 100 } },
    ],
  });
};

export const claimDailyMission = async (req, res, next) => {
  try {
    const { missionId } = req.params;
    const creditRes = await WalletService.credit(
      req.user._id,
      250,
      'DAILY_BONUS',
      `DAILY_MISSION_${missionId}`
    );

    res.status(200).json({
      message: `Claimed daily mission reward: +250 Credits`,
      wallet: creditRes.wallet,
    });
  } catch (err) {
    next(err);
  }
};

export const getAchievements = (req, res) => {
  res.status(200).json({
    achievements: [
      { id: 'first_contact', title: 'First Contact', reward: { credits: 100, xp: 50 } },
      { id: 'first_victory', title: 'First Victory', reward: { credits: 200, xp: 100 } },
      { id: 'fleet_recruit', title: 'Fleet Recruit', reward: { credits: 300, xp: 150, energyCores: 1 } },
      { id: 'elite_hunter', title: 'Elite Hunter', reward: { credits: 500, xp: 250 } },
      { id: 'boss_breaker', title: 'Boss Breaker', reward: { credits: 750, xp: 400, energyCores: 2 } },
      { id: 'sector_explorer', title: 'Sector Explorer', reward: { credits: 400, xp: 200 } },
      { id: 'ace_pilot', title: 'Ace Pilot', reward: { credits: 350, xp: 150 } },
      { id: 'shield_specialist', title: 'Shield Specialist', reward: { credits: 300, xp: 120 } },
      { id: 'power_collector', title: 'Power Collector', reward: { credits: 450, xp: 200 } },
      { id: 'void_conqueror', title: 'Void Conqueror', reward: { credits: 5000, xp: 2000, energyCores: 10 } },
    ],
  });
};

export const getEvents = (req, res) => {
  res.status(200).json({
    events: [
      {
        id: 'event_nebula_incursion',
        title: 'Crimson Nebula Blitz',
        description: 'Elite alien raiders are invading Sector 2. Double credits awarded on all elite kills.',
        active: true,
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
      },
    ],
  });
};
