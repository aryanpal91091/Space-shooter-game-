# SPACE SHOOTER ODYSSEY — SECURITY & ANTI-CHEAT SPECIFICATION

## 1. Authentication & Session Protection
- **Passwords**: Hashed with `bcryptjs` using 10 salt rounds. Plaintext passwords are never logged or stored.
- **JWT Authorization**: Signed using server-secret `JWT_SECRET` with configurable expiration (7 days default). Bearer tokens are sent via `Authorization: Bearer <token>`.
- **Protected Routes**: Middleware verifies valid signatures, extracts `userId`, and ensures user account active status.

## 2. Server-Side Validation & Anti-Cheat Controls
Because browser-based games execute JavaScript on client machines, the server implements active plausibility checking:
1. **Completion Duration Bounds**: A mission cannot be completed faster than minimum theoretical wave spawn times (e.g., minimum 10 seconds for short tutorial, 35 seconds for standard waves).
2. **Score Bounds**: Final score cannot exceed `(enemies_spawned * max_enemy_score + boss_score + time_bonus) * multiplier`.
3. **Session Ownership & Single-Use**: Each mission run receives a UUID `sessionId`. Once finalized (`COMPLETED` or `DEFEATED`), it cannot be submitted again.
4. **Idempotency Keys**: Reward claims and transactions use unique event IDs to prevent replay attacks and duplicate payouts.
5. **Wallet Guardrails**: Negative balances are strictly rejected at the database query level with atomic MongoDB operations (`$inc` with condition `$gte: cost`).

## 3. Network & Infrastructure Defenses
- **Express Rate Limiting**: 
  - Auth routes (`/api/auth/*`): 15 requests per 15 minutes to defeat brute force attacks.
  - Economy & Ad routes (`/api/rewards/*`, `/api/games/*`): 60 requests per minute.
  - General API: 150 requests per minute.
- **Helmet.js**: Sets security HTTP headers (X-Content-Type-Options, Frameguard, XSS protection).
- **CORS Policy**: Configured to restrict cross-origin requests to trusted origins (`CLIENT_URL`).
