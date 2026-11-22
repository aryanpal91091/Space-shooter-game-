/**
 * Authoritative Server-Controlled Economy Configuration
 */
export const ECONOMY_CONFIG = {
  missionCompletionCredits: 100,
  eliteEnemyCredits: 10,
  bossCompletionCredits: 250,
  threeStarBonusCredits: 50,
  rewardedAds: {
    enabled: true,
    reviveEnabled: true,
    doubleScoreEnabled: true,
    doubleCreditsEnabled: true,
    extraShieldEnabled: true,
    maxRevivesPerMission: 1,
    maxDoubleScorePerMission: 1,
    maxDoubleCreditsPerMission: 1,
    maxRewardedAdsPerDay: 10,
    maxRewardedAdsPerSession: 5,
    minSecondsBetweenRewardedAds: 30,
  },
  placements: {
    REVIVE: {
      description: 'Defeat Checkpoint Continuation',
      maxPerMission: 1,
      cooldownSeconds: 30,
    },
    DOUBLE_CREDITS: {
      multiplier: 2.0,
      description: 'Double Mission Victory Credits',
      maxPerMission: 1,
      cooldownSeconds: 30,
    },
    DOUBLE_SCORE: {
      multiplier: 2.0,
      description: 'Double Leaderboard High Score',
      maxPerMission: 1,
      cooldownSeconds: 30,
    },
    EMERGENCY_SHIELD: {
      description: 'Complimentary Defensive Shield Orb',
      maxPerMission: 1,
      cooldownSeconds: 60,
    },
  },
  upgradePricing: {
    weaponDamage: 150,
    fireRate: 200,
    maxHealth: 120,
    moveSpeed: 100,
    shieldCapacity: 180,
    specialCooldown: 250,
  },
};
