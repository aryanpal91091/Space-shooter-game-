import AdOpportunity from '../../models/AdOpportunity.js';
import RewardTransaction from '../../models/RewardTransaction.js';
import GameSession from '../../models/GameSession.js';
import PlayerInventory from '../../models/PlayerInventory.js';
import { WalletService } from '../economy/walletService.js';
import { ECONOMY_CONFIG } from '../../config/economyConfig.js';
import { activeAdProvider } from './adProviderAdapter.js';

export class RewardedAdService {
  /**
   * Create an ad opportunity with 5-minute expiration
   */
  static async createOpportunity(userId, placement, sessionId = null) {
    const limits = ECONOMY_CONFIG.rewardedAds;

    // Check Daily Cap (max 10/day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const dailyCount = await AdOpportunity.countDocuments({
      user: userId,
      status: 'GRANTED',
      createdAt: { $gte: startOfDay },
    });

    if (dailyCount >= limits.maxRewardedAdsPerDay) {
      throw new Error(`Daily rewarded ad quota reached (${limits.maxRewardedAdsPerDay} max/day).`);
    }

    // Check Session Cap if session provided
    if (sessionId) {
      const sessionCount = await AdOpportunity.countDocuments({
        user: userId,
        sessionId,
        status: 'GRANTED',
      });
      if (sessionCount >= limits.maxRewardedAdsPerSession) {
        throw new Error(`Session rewarded ad threshold reached (${limits.maxRewardedAdsPerSession} max/session).`);
      }
    }

    // Check Cooldown (30 seconds)
    const recentAd = await AdOpportunity.findOne({
      user: userId,
      status: 'GRANTED',
    }).sort({ claimedAt: -1 });

    if (recentAd && recentAd.claimedAt) {
      const elapsedSeconds = (Date.now() - new Date(recentAd.claimedAt).getTime()) / 1000;
      if (elapsedSeconds < limits.minSecondsBetweenRewardedAds) {
        const remaining = Math.ceil(limits.minSecondsBetweenRewardedAds - elapsedSeconds);
        throw new Error(`Rewarded ad cooldown active. Please wait ${remaining} seconds.`);
      }
    }

    const opportunityId = `opp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const opportunity = await AdOpportunity.create({
      opportunityId,
      user: userId,
      sessionId,
      placement,
      provider: activeAdProvider.providerName,
      status: 'OFFERED',
      expiresAt,
    });

    return opportunity;
  }

  /**
   * Verify ad completion callback
   */
  static async verifyAdEvent(userId, opportunityId, payload = {}) {
    const opportunity = await AdOpportunity.findOne({ opportunityId, user: userId });

    if (!opportunity) {
      throw new Error('Ad opportunity record not found.');
    }

    if (new Date() > opportunity.expiresAt) {
      opportunity.status = 'EXPIRED';
      await opportunity.save();
      throw new Error('Ad opportunity has expired.');
    }

    const verificationResult = await activeAdProvider.verifyCompletion(opportunityId, payload);

    if (verificationResult.verified) {
      opportunity.status = 'VERIFIED';
      opportunity.verifiedAt = new Date();
      await opportunity.save();
      return { success: true, opportunity };
    } else {
      opportunity.status = 'REJECTED';
      await opportunity.save();
      throw new Error('Provider callback verification failed.');
    }
  }

  /**
   * Idempotent claim processing
   */
  static async claimReward(userId, opportunityId, sessionId = null) {
    const opportunity = await AdOpportunity.findOne({ opportunityId, user: userId });

    if (!opportunity) {
      throw new Error('Ad opportunity not found.');
    }

    // Idempotency check: Already granted!
    if (opportunity.status === 'GRANTED') {
      const existingTx = await RewardTransaction.findOne({ opportunityId });
      return {
        alreadyGranted: true,
        message: 'Reward has already been safely processed and granted.',
        transaction: existingTx,
      };
    }

    if (opportunity.status !== 'VERIFIED') {
      throw new Error(`Cannot claim reward in unverified state: ${opportunity.status}`);
    }

    let rewardDetails = { credits: 0, multiplier: 1.0, placement: opportunity.placement };

    if (opportunity.placement === 'REVIVE') {
      if (sessionId) {
        const session = await GameSession.findOne({ sessionId, user: userId });
        if (session) {
          if (session.revivesUsed >= 1) {
            throw new Error('Maximum 1 revive per mission session reached.');
          }
          session.revivesUsed += 1;
          await session.save();
        }
      }
      rewardDetails.description = 'Mission Checkpoint Revive Activated';
    } else if (opportunity.placement === 'DOUBLE_CREDITS') {
      let baseCredits = 150;
      if (sessionId) {
        const session = await GameSession.findOne({ sessionId, user: userId });
        if (session) {
          if (session.doubleCreditsClaimed) {
            throw new Error('Double credits already claimed for this mission session.');
          }
          session.doubleCreditsClaimed = true;
          await session.save();
          baseCredits = 200;
        }
      }
      const creditResult = await WalletService.credit(
        userId,
        baseCredits,
        'AD_REWARD',
        'REWARDED_AD_DOUBLE_CREDITS',
        opportunityId
      );
      rewardDetails.credits = baseCredits;
      rewardDetails.wallet = creditResult.wallet;
    } else if (opportunity.placement === 'DOUBLE_SCORE') {
      if (sessionId) {
        const session = await GameSession.findOne({ sessionId, user: userId });
        if (session) {
          if (session.doubleScoreClaimed) {
            throw new Error('Double score already applied to this mission run.');
          }
          session.doubleScoreClaimed = true;
          session.score *= 2;
          await session.save();
          rewardDetails.newScore = session.score;
        }
      }
    } else if (opportunity.placement === 'EMERGENCY_SHIELD') {
      let inv = await PlayerInventory.findOne({ user: userId });
      if (!inv) inv = await PlayerInventory.create({ user: userId });
      inv.powerups.shield_pulse = (inv.powerups.shield_pulse || 0) + 1;
      await inv.save();
      rewardDetails.inventory = inv;
    }

    // Record immutable RewardTransaction
    const rewardTx = await RewardTransaction.create({
      user: userId,
      sessionId: opportunity.sessionId || sessionId,
      opportunityId,
      placement: opportunity.placement,
      amount: rewardDetails.credits || 0,
      multiplier: rewardDetails.multiplier || 1.0,
      adProvider: opportunity.provider,
      verificationStatus: 'VERIFIED',
    });

    // Mark opportunity GRANTED
    opportunity.status = 'GRANTED';
    opportunity.claimedAt = new Date();
    await opportunity.save();

    return { success: true, rewardDetails, transaction: rewardTx };
  }
}
