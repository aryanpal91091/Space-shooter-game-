import GameSession from '../../models/GameSession.js';
import PlayerMissionProgress from '../../models/PlayerMissionProgress.js';
import PlayerProfile from '../../models/PlayerProfile.js';
import LeaderboardEntry from '../../models/LeaderboardEntry.js';
import User from '../../models/User.js';
import { WalletService } from '../economy/walletService.js';
import { ECONOMY_CONFIG } from '../../config/economyConfig.js';

export class SessionService {
  /**
   * Initialize a new game session
   */
  static async startSession(userId, missionId, shipId) {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const session = await GameSession.create({
      sessionId,
      user: userId,
      missionId,
      selectedShipId: shipId,
      status: 'ACTIVE',
      startTime: new Date(),
    });

    return session;
  }

  /**
   * Finalize session with server anti-cheat plausibility validation
   */
  static async completeSession(userId, sessionId, telemetry) {
    const session = await GameSession.findOne({ sessionId, user: userId });

    if (!session) {
      throw new Error('Game session not found or user unauthorized.');
    }

    if (session.status !== 'ACTIVE') {
      throw new Error(`Session already finalized with status: ${session.status}. Replay attack prevented.`);
    }

    const {
      score = 0,
      duration = 0,
      enemiesDefeated = 0,
      bossDefeated = false,
      accuracy = 0,
      damageTaken = 0,
      stars = 1,
      status = 'VICTORY',
    } = telemetry;

    // --- ANTI-CHEAT VALIDATIONS ---
    // 1. Duration Plausibility Check (Missions cannot be cleared in under 3 seconds)
    if (status === 'VICTORY' && duration < 3) {
      throw new Error('Impossible completion time detected. Session flagged.');
    }

    // 2. Score Upper Bound Check (Max theoretical score: 250,000)
    if (score > 250000 || score < 0) {
      throw new Error('Score out of plausible bounds. Result rejected.');
    }

    // Finalize session
    session.status = status;
    session.score = score;
    session.durationSeconds = duration;
    session.enemiesDefeated = enemiesDefeated;
    session.bossDefeated = bossDefeated;
    session.damageTaken = damageTaken;
    session.stars = stars;
    session.endTime = new Date();
    await session.save();

    let walletUpdate = null;

    if (status === 'VICTORY') {
      // Calculate reward
      const baseCredits = ECONOMY_CONFIG.missionCompletionCredits + (bossDefeated ? ECONOMY_CONFIG.bossCompletionCredits : 0);
      const starBonus = stars === 3 ? ECONOMY_CONFIG.threeStarBonusCredits : 0;
      const totalCredits = baseCredits + starBonus;

      // Credit wallet
      const creditRes = await WalletService.credit(
        userId,
        totalCredits,
        'MISSION_REWARD',
        `MISSION_CLEAR_${session.missionId}`,
        sessionId
      );
      walletUpdate = creditRes.wallet;

      // Persist Mission Progress & Unlock Next Mission
      let progress = await PlayerMissionProgress.findOne({ user: userId, missionId: session.missionId });
      if (!progress) {
        progress = new PlayerMissionProgress({ user: userId, missionId: session.missionId });
      }
      progress.completed = true;
      progress.unlocked = true;
      progress.stars = Math.max(progress.stars, stars);
      progress.bestScore = Math.max(progress.bestScore, score);
      progress.completedAt = new Date();
      await progress.save();

      // Unlock next sequential mission
      const match = session.missionId.match(/m-(\d+)/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        if (nextNum <= 50) {
          const nextId = `m-${nextNum}`;
          await PlayerMissionProgress.findOneAndUpdate(
            { user: userId, missionId: nextId },
            { $set: { unlocked: true } },
            { upsert: true }
          );
        }
      }

      // Update Profile Stats & Career XP
      const profile = await PlayerProfile.findOne({ user: userId });
      if (profile) {
        profile.xp += 50 + (bossDefeated ? 200 : 0);
        profile.level = Math.floor(profile.xp / 500) + 1;
        profile.stats.missionsCompleted += 1;
        profile.stats.enemiesKilled += enemiesDefeated;
        if (bossDefeated) profile.stats.bossesKilled += 1;
        profile.stats.highestScore = Math.max(profile.stats.highestScore, score);
        await profile.save();
      }

      // Record in Leaderboard
      const userDoc = await User.findById(userId);
      if (userDoc) {
        await LeaderboardEntry.create({
          user: userId,
          username: userDoc.username,
          score,
          missionsCompleted: profile?.stats?.missionsCompleted || 1,
          ship: session.selectedShipId,
          sessionId,
        });
      }
    }

    return {
      success: true,
      session,
      wallet: walletUpdate,
    };
  }
}
