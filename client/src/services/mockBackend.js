/**
 * Mock / Offline Backend Service for SPACE SHOOTER ODYSSEY
 * Provides instant, zero-latency state persistence via localStorage
 * Activated whenever the remote API is unreachable (e.g. standalone Vercel deployment, offline mode)
 */

const STORAGE_KEYS = {
  USER: 'odyssey_user',
  TOKEN: 'odyssey_token',
  WALLET: 'odyssey_mock_wallet',
  FLEET: 'odyssey_mock_fleet',
  PROGRESS: 'odyssey_mock_progress',
  INVENTORY: 'odyssey_mock_inventory',
  LEADERBOARD: 'odyssey_mock_leaderboard',
  HISTORY: 'odyssey_mock_history',
};

const getDefaultWallet = () => ({
  credits: 1500,
  energyCores: 5,
  xp: 120,
  level: 1,
  veloopCoins: 25,
});

const getDefaultFleet = () => ({
  selectedShipId: 'interceptor',
  unlockedShips: ['interceptor', 'striker'],
  upgrades: {
    interceptor: { weaponDamage: 1, fireRate: 1, maxHealth: 1, moveSpeed: 1, shieldCapacity: 1, specialCooldown: 1 },
    striker: { weaponDamage: 1, fireRate: 1, maxHealth: 1, moveSpeed: 1, shieldCapacity: 1, specialCooldown: 1 },
    guardian: { weaponDamage: 1, fireRate: 1, maxHealth: 1, moveSpeed: 1, shieldCapacity: 1, specialCooldown: 1 },
    support: { weaponDamage: 1, fireRate: 1, maxHealth: 1, moveSpeed: 1, shieldCapacity: 1, specialCooldown: 1 },
    experimental: { weaponDamage: 1, fireRate: 1, maxHealth: 1, moveSpeed: 1, shieldCapacity: 1, specialCooldown: 1 },
  },
});

const getDefaultProgress = () => ({
  unlockedMissions: ['m-1', 'm-2'],
  completedMissions: {},
  dailyStreak: 3,
  lastDailyClaim: new Date().toISOString(),
});

const getDefaultInventory = () => ({
  shield_pulse: 3,
  rapid_fire: 3,
  spread_shot: 2,
  homing_missiles: 2,
  emp_blast: 2,
  repair_drone: 2,
  overdrive: 1,
  emergency_warp: 2,
});

const getDefaultLeaderboard = () => [
  { rank: 1, username: 'ValkyrieAce', score: 45200, ship: 'experimental', sector: 'Sector 5' },
  { rank: 2, username: 'NovaGhost', score: 38900, ship: 'striker', sector: 'Sector 4' },
  { rank: 3, username: 'CommanderPilot', score: 31400, ship: 'interceptor', sector: 'Sector 3' },
  { rank: 4, username: 'CyberPhoenix', score: 24650, ship: 'guardian', sector: 'Sector 2' },
  { rank: 5, username: 'StarDrifter', score: 18200, ship: 'interceptor', sector: 'Sector 1' },
];

function getStored(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function saveStored(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

export const mockBackend = {
  handleRequest: async (config) => {
    const url = config.url.replace(/^\/api/, '');
    const method = (config.method || 'get').toLowerCase();
    const data = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};

    // 1. Auth routes
    if (url === '/auth/login' && method === 'post') {
      const email = data.email || 'pilot@veloop.io';
      const username = email.split('@')[0] || 'CommanderPilot';
      const user = { id: 'usr-demo-01', username, email, role: 'Commander' };
      const token = 'mock_jwt_token_' + Date.now();
      saveStored(STORAGE_KEYS.USER, user);
      saveStored(STORAGE_KEYS.TOKEN, token);
      return { status: 200, data: { token, user, message: 'Authentication successful (Arcade Demo Mode)' } };
    }

    if (url === '/auth/register' && method === 'post') {
      const user = {
        id: 'usr-reg-' + Date.now(),
        username: data.username || 'StarPilot',
        email: data.email || 'pilot@fleet.io',
        role: 'Rookie',
      };
      const token = 'mock_jwt_token_' + Date.now();
      saveStored(STORAGE_KEYS.USER, user);
      saveStored(STORAGE_KEYS.TOKEN, token);
      return { status: 201, data: { token, user } };
    }

    if (url === '/auth/me') {
      const user = getStored(STORAGE_KEYS.USER, {
        id: 'usr-demo-01',
        username: 'CommanderPilot',
        email: 'pilot@veloop.io',
        role: 'Commander',
      });
      return { status: 200, data: { user } };
    }

    // 2. Wallet & Economy
    if (url === '/wallet/balance') {
      const wallet = getStored(STORAGE_KEYS.WALLET, getDefaultWallet());
      return { status: 200, data: wallet };
    }

    if (url === '/wallet/history') {
      const history = getStored(STORAGE_KEYS.HISTORY, [
        { id: 'tx-1', type: 'MISSION_REWARD', amount: 350, currency: 'credits', description: 'Mission Alpha complete', createdAt: new Date().toISOString() },
        { id: 'tx-2', type: 'AD_REWARD', amount: 200, currency: 'credits', description: 'Holosponsor transmission watched', createdAt: new Date(Date.now() - 3600000).toISOString() },
      ]);
      return { status: 200, data: { history } };
    }

    // 3. Player Fleet & Ships
    if (url === '/ships/owned') {
      const fleet = getStored(STORAGE_KEYS.FLEET, getDefaultFleet());
      return { status: 200, data: fleet };
    }

    if (url.startsWith('/ships/') && url.endsWith('/upgrade') && method === 'post') {
      const shipId = url.split('/')[2];
      const attribute = data.attribute;
      const fleet = getStored(STORAGE_KEYS.FLEET, getDefaultFleet());
      const wallet = getStored(STORAGE_KEYS.WALLET, getDefaultWallet());

      if (fleet.upgrades[shipId] && fleet.upgrades[shipId][attribute] !== undefined) {
        fleet.upgrades[shipId][attribute] += 1;
        wallet.credits = Math.max(0, wallet.credits - 250);
        saveStored(STORAGE_KEYS.FLEET, fleet);
        saveStored(STORAGE_KEYS.WALLET, wallet);
      }
      return { status: 200, data: { success: true, fleet, wallet } };
    }

    if (url.startsWith('/ships/') && url.endsWith('/unlock') && method === 'post') {
      const shipId = url.split('/')[2];
      const fleet = getStored(STORAGE_KEYS.FLEET, getDefaultFleet());
      const wallet = getStored(STORAGE_KEYS.WALLET, getDefaultWallet());

      if (!fleet.unlockedShips.includes(shipId)) {
        fleet.unlockedShips.push(shipId);
        wallet.credits = Math.max(0, wallet.credits - 1000);
        saveStored(STORAGE_KEYS.FLEET, fleet);
        saveStored(STORAGE_KEYS.WALLET, wallet);
      }
      return { status: 200, data: { success: true, fleet, wallet } };
    }

    if (url.startsWith('/ships/') && url.endsWith('/select') && method === 'post') {
      const shipId = url.split('/')[2];
      const fleet = getStored(STORAGE_KEYS.FLEET, getDefaultFleet());
      fleet.selectedShipId = shipId;
      saveStored(STORAGE_KEYS.FLEET, fleet);
      return { status: 200, data: { success: true, selectedShipId: shipId } };
    }

    // 4. Progress & Missions
    if (url === '/player/progress') {
      const progress = getStored(STORAGE_KEYS.PROGRESS, getDefaultProgress());
      return { status: 200, data: progress };
    }

    // 5. Inventory & Power-ups
    if (url === '/player/inventory') {
      const inv = getStored(STORAGE_KEYS.INVENTORY, getDefaultInventory());
      return { status: 200, data: inv };
    }

    if (url.startsWith('/powerups/') && url.endsWith('/acquire') && method === 'post') {
      const powerUpId = url.split('/')[2];
      const inv = getStored(STORAGE_KEYS.INVENTORY, getDefaultInventory());
      const wallet = getStored(STORAGE_KEYS.WALLET, getDefaultWallet());

      inv[powerUpId] = (inv[powerUpId] || 0) + 1;
      wallet.credits = Math.max(0, wallet.credits - 150);
      saveStored(STORAGE_KEYS.INVENTORY, inv);
      saveStored(STORAGE_KEYS.WALLET, wallet);
      return { status: 200, data: { success: true, inventory: inv, wallet } };
    }

    // 6. Game Sessions
    if (url === '/games/start' && method === 'post') {
      const sessionId = 'session_' + Math.random().toString(36).substring(2, 9);
      return {
        status: 200,
        data: {
          sessionId,
          missionId: data.missionId || 'm-1',
          shipId: data.shipId || 'interceptor',
          serverNonce: 'nonce_' + Date.now(),
        },
      };
    }

    if (url.includes('/games/') && url.endsWith('/complete') && method === 'post') {
      const { score = 0, enemiesDestroyed = 0, accuracy = 85, victory = false, missionId = 'm-1' } = data;
      const wallet = getStored(STORAGE_KEYS.WALLET, getDefaultWallet());
      const progress = getStored(STORAGE_KEYS.PROGRESS, getDefaultProgress());

      const earnedCredits = Math.round(score * 0.1) + (victory ? 250 : 50);
      const earnedXP = Math.round(score * 0.05) + (victory ? 100 : 25);

      wallet.credits += earnedCredits;
      wallet.xp += earnedXP;
      wallet.level = Math.floor(wallet.xp / 500) + 1;
      saveStored(STORAGE_KEYS.WALLET, wallet);

      if (victory) {
        progress.completedMissions[missionId] = true;
        const currentIdx = parseInt(missionId.replace('m-', ''), 10) || 1;
        const nextMission = `m-${currentIdx + 1}`;
        if (!progress.unlockedMissions.includes(nextMission)) {
          progress.unlockedMissions.push(nextMission);
        }
        saveStored(STORAGE_KEYS.PROGRESS, progress);
      }

      return {
        status: 200,
        data: {
          success: true,
          rewards: {
            credits: earnedCredits,
            xp: earnedXP,
            levelUp: wallet.level > 1,
            newLevel: wallet.level,
          },
        },
      };
    }

    // 7. Rewarded Ads Simulation
    if (url === '/rewards/ad/opportunity' && method === 'post') {
      return {
        status: 200,
        data: {
          adOpportunityId: 'ad_opp_' + Date.now(),
          placement: data.placement || 'post_mission',
          rewardPreview: { credits: 250, energyCores: 1 },
        },
      };
    }

    if (url === '/rewards/ad/verify' && method === 'post') {
      return { status: 200, data: { verified: true, verificationToken: 'vtok_' + Date.now() } };
    }

    if (url === '/rewards/ad/claim' && method === 'post') {
      const wallet = getStored(STORAGE_KEYS.WALLET, getDefaultWallet());
      wallet.credits += 250;
      wallet.energyCores += 1;
      saveStored(STORAGE_KEYS.WALLET, wallet);
      return {
        status: 200,
        data: {
          success: true,
          rewardGranted: { credits: 250, energyCores: 1 },
          newBalance: wallet,
        },
      };
    }

    // 8. Leaderboard
    if (url === '/leaderboard') {
      const lb = getStored(STORAGE_KEYS.LEADERBOARD, getDefaultLeaderboard());
      return { status: 200, data: { leaderboard: lb } };
    }

    // Fallback healthy
    return { status: 200, data: { status: 'mock_healthy', timestamp: new Date().toISOString() } };
  },
};
