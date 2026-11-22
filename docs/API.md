# SPACE SHOOTER ODYSSEY — REST API SPECIFICATION

Base URL: `http://localhost:5000/api`

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` - Create account `{ username, email, password }`
- `POST /api/auth/login` - Authenticate `{ email, password }` ➔ Returns JWT token & user profile
- `GET /api/auth/me` - Get authenticated profile `[Bearer Token]`
- `POST /api/auth/logout` - Invalidate session token

### 2. Player Profile & Dashboard (`/api/player`)
- `GET /api/player/profile` - Player details, current level, XP, selected ship, active statistics
- `PUT /api/player/profile` - Update display name, avatar
- `GET /api/player/progress` - Campaign progress, unlocked sectors and missions
- `GET /api/player/inventory` - Owned power-ups and consumable quantities
- `GET /api/player/history` - Recent mission run logs and performance data

### 3. Ships & Hangar (`/api/ships`)
- `GET /api/ships` - All available ship blueprints and baseline stats
- `GET /api/ships/owned` - User's fleet status and current upgrade levels
- `POST /api/ships/:shipId/select` - Set active flagship for missions
- `POST /api/ships/:shipId/unlock` - Unlock new ship with Energy Cores or Credits
- `POST /api/ships/:shipId/upgrade` - Upgrade an attribute (e.g., `damage`, `health`, `fireRate`, `shield`, `speed`)

### 4. Missions & Game Sessions (`/api/missions` & `/api/games`)
- `GET /api/missions` - List all 50 missions with user's star ratings and unlock statuses
- `GET /api/missions/:missionId` - Fetch detailed mission wave data, objectives, and boss config
- `POST /api/games/start` - Initialize session `{ missionId, shipId }` ➔ Returns `sessionId` & validation token
- `POST /api/games/:sessionId/complete` - Submit combat telemetry `{ score, duration, enemiesDefeated, damageTaken, stars, status: 'VICTORY' | 'DEFEAT' }`
- `GET /api/games/history` - Completed mission history ledger

### 5. Rewarded Ads & Economy (`/api/rewards` & `/api/wallet`)
- `GET /api/economy/config` - Server-authoritative economy rates, upgrade costs, ad caps
- `GET /api/wallet/balance` - Live balances (Credits, Energy Cores, XP, Reward Coins)
- `GET /api/wallet/history` - Full transactional audit trail
- `POST /api/rewards/ad/opportunity` - Generate ad opportunity `{ placement: 'REVIVE' | 'DOUBLE_CREDITS' | 'DOUBLE_SCORE' | 'EMERGENCY_SHIELD', sessionId }`
- `POST /api/rewards/ad/verify` - Verify ad completion callback
- `POST /api/rewards/ad/claim` - Claim verified reward idempotently

### 6. Engagement & Live Operations
- `GET /api/daily-missions` - Daily objectives, progress counters, and completion states
- `POST /api/daily-missions/:missionId/claim` - Claim daily mission reward
- `POST /api/daily-login/claim` - Claim daily login calendar reward
- `GET /api/achievements` - List 10 achievements with progress and unlock timestamps
- `GET /api/leaderboard` - Global top rankings and current user's percentile position
