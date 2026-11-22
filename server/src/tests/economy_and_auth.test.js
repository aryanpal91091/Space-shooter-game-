import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { WalletService } from '../services/economy/walletService.js';
import { RewardedAdService } from '../services/ads/rewardedAdService.js';
import { SessionService } from '../services/game/sessionService.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';

describe('Space Shooter Odyssey — Comprehensive Backend & Economy Test Suite', () => {
  let authToken = '';
  let testUserId = '';

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  // --- 1. AUTHENTICATION & SECURITY TESTS ---
  describe('Authentication & Security', () => {
    const testPilot = {
      username: `TestPilot_${Date.now()}`,
      email: `pilot_${Date.now()}@odyssey.com`,
      password: 'SecureClearance2026!',
    };

    it('successfully registers a new pilot and provides JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testPilot);

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe(testPilot.username);
      authToken = res.body.token;
      testUserId = res.body.user.id;
    });

    it('rejects duplicate registration with identical email or call-sign', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testPilot);

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already enlisted');
    });

    it('authenticates valid login and returns authorization token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testPilot.email,
          password: testPilot.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('rejects invalid password with 401 unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testPilot.email,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
    });

    it('protects authenticated endpoints from missing bearer token', async () => {
      const res = await request(app).get('/api/player/profile');
      expect(res.status).toBe(401);
    });

    it('allows access to protected routes with valid bearer token', async () => {
      const res = await request(app)
        .get('/api/player/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.level).toBeDefined();
    });
  });

  // --- 2. WALLET & ATOMIC ECONOMY TESTS ---
  describe('Authoritative Wallet & Ledger Guardrails', () => {
    it('initializes wallet with baseline starting credits (500 CR)', async () => {
      const res = await request(app)
        .get('/api/wallet/balance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.credits).toBe(500);
      expect(res.body.energyCores).toBe(2);
    });

    it('rejects debit requests exceeding available wallet balance (prevents negative balance)', async () => {
      await expect(
        WalletService.debit(testUserId, 99999, 'DEBIT', 'ILLEGAL_OVERDRAFT')
      ).rejects.toThrow(/Insufficient/);

      // Verify balance was untouched
      const wallet = await Wallet.findOne({ user: testUserId });
      expect(wallet.credits).toBe(500);
    });

    it('atomically deducts credits for valid purchases and logs transaction', async () => {
      const result = await WalletService.debit(testUserId, 200, 'UPGRADE_PURCHASE', 'TEST_UPGRADE');
      expect(result.wallet.credits).toBe(300);
      expect(result.transaction.amount).toBe(200);
      expect(result.transaction.balanceBefore).toBe(500);
      expect(result.transaction.balanceAfter).toBe(300);
    });

    it('atomically credits rewards and updates ledger', async () => {
      const result = await WalletService.credit(testUserId, 150, 'MISSION_REWARD', 'TEST_MISSION');
      expect(result.wallet.credits).toBe(450);
      expect(result.transaction.balanceBefore).toBe(300);
      expect(result.transaction.balanceAfter).toBe(450);
    });
  });

  // --- 3. REWARDED AD IDEMPOTENCY & LIMITS ---
  describe('Rewarded Ad Verification & Idempotency', () => {
    let testOpportunityId = '';

    it('creates an ad opportunity with valid status and expiration', async () => {
      const opp = await RewardedAdService.createOpportunity(testUserId, 'DOUBLE_CREDITS');
      expect(opp.opportunityId).toBeDefined();
      expect(opp.status).toBe('OFFERED');
      expect(opp.expiresAt.getTime()).toBeGreaterThan(Date.now());
      testOpportunityId = opp.opportunityId;
    });

    it('rejects claims on unverified ad opportunities', async () => {
      await expect(
        RewardedAdService.claimReward(testUserId, testOpportunityId)
      ).rejects.toThrow(/Cannot claim reward in unverified state/);
    });

    it('verifies ad completion via provider adapter', async () => {
      const verifyRes = await RewardedAdService.verifyAdEvent(testUserId, testOpportunityId);
      expect(verifyRes.success).toBe(true);
      expect(verifyRes.opportunity.status).toBe('VERIFIED');
    });

    it('processes verified reward claim idempotently (claims only once)', async () => {
      const firstClaim = await RewardedAdService.claimReward(testUserId, testOpportunityId);
      expect(firstClaim.success).toBe(true);

      // Replaying the same claim event must be caught idempotently!
      const duplicateClaim = await RewardedAdService.claimReward(testUserId, testOpportunityId);
      expect(duplicateClaim.alreadyGranted).toBe(true);
    });
  });

  // --- 4. GAME SESSION LIFECYCLE & ANTI-CHEAT ---
  describe('Game Session & Anti-Cheat Validation', () => {
    let activeSessionId = '';

    it('starts a valid mission session and returns unique sessionId', async () => {
      const session = await SessionService.startSession(testUserId, 'm-1', 'interceptor');
      expect(session.sessionId).toBeDefined();
      expect(session.status).toBe('ACTIVE');
      activeSessionId = session.sessionId;
    });

    it('rejects impossible mission completion times (< 3 seconds)', async () => {
      await expect(
        SessionService.completeSession(testUserId, activeSessionId, {
          score: 5000,
          duration: 1, // 1 second is impossible
          status: 'VICTORY',
        })
      ).rejects.toThrow(/Impossible completion time/);
    });

    it('rejects impossible hacked scores (> 250,000 pts)', async () => {
      await expect(
        SessionService.completeSession(testUserId, activeSessionId, {
          score: 9999999, // Hacked billion score
          duration: 45,
          status: 'VICTORY',
        })
      ).rejects.toThrow(/Score out of plausible bounds/);
    });

    it('completes session with plausible telemetry and credits mission rewards', async () => {
      const result = await SessionService.completeSession(testUserId, activeSessionId, {
        score: 4500,
        duration: 35,
        enemiesDefeated: 15,
        stars: 3,
        status: 'VICTORY',
      });

      expect(result.success).toBe(true);
      expect(result.session.status).toBe('VICTORY');
    });

    it('prevents replay attacks on finalized sessions', async () => {
      await expect(
        SessionService.completeSession(testUserId, activeSessionId, {
          score: 4500,
          duration: 35,
          status: 'VICTORY',
        })
      ).rejects.toThrow(/already finalized/);
    });
  });

  // --- 5. CATALOGS & POWER-UPS INTEGRATION TESTS ---
  describe('Full Catalog & Power-Up Economy Endpoints', () => {
    it('GET /api/missions returns all 5 sectors and 50 data-driven missions', async () => {
      const res = await request(app).get('/api/missions');
      expect(res.status).toBe(200);
      expect(res.body.sectors.length).toBe(5);
      expect(res.body.missions.length).toBe(50);
      expect(res.body.missions[0].id).toBe('m-1');
      expect(res.body.missions[49].id).toBe('m-50');
    });

    it('GET /api/ships returns 5 ship classes with specs and upgrade paths', async () => {
      const res = await request(app).get('/api/ships');
      expect(res.status).toBe(200);
      expect(res.body.ships.length).toBe(5);
    });

    it('GET /api/powerups returns 8 mandatory power-ups', async () => {
      const res = await request(app).get('/api/powerups');
      expect(res.status).toBe(200);
      expect(res.body.powerups.length).toBe(8);
    });

    it('POST /api/powerups/:powerUpId/acquire atomically buys a power-up', async () => {
      const res = await request(app)
        .post('/api/powerups/shield_pulse/acquire')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.powerUpId).toBe('shield_pulse');
      expect(res.body.inventory.shield_pulse).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/rewards/history returns reward ledger entries', async () => {
      const res = await request(app)
        .get('/api/rewards/history')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.rewards)).toBe(true);
    });

    it('GET /api/events/:eventId/progress returns active event telemetry', async () => {
      const res = await request(app)
        .get('/api/events/event_nebula_incursion/progress')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.active).toBe(true);
    });
  });
});
