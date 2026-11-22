# SPACE SHOOTER ODYSSEY — ECONOMY ARCHITECTURE

## 1. Currency Hierarchy & Purpose

| Currency | Classification | Acquisition Sources | Primary Sinks |
|----------|----------------|---------------------|---------------|
| **Credits** | Soft In-Game Currency | Missions, Pickups, Daily Rewards, Rewarded Ads | Ship upgrades, Power-up acquisitions |
| **Energy Cores** | Hard / Progression Currency | Boss defeats, Sector completions, Milestones | Unlocking premium ships & high-tier upgrades |
| **XP** | Progression Metric | All combat engagements, mission clears | Player level, unlocking new sectors and missions |
| **VELoop Reward Coins** | Platform-Eligible Rewards | Controlled events & partner promotions | Distinct platform balance (non-inflated) |

> **Important**: In-game Credits and Energy Cores are strictly virtual game tokens with no external cash value. Platform-eligible rewards remain isolated in a separate audited balance ledger under VELoop policy.

## 2. Authoritative Economy Flow
1. **Zero Client Authority**: The frontend can never report arbitrary credits or award items directly.
2. **Game Session Validation**: When starting a mission (`POST /api/games/start`), an encrypted session token is initialized.
3. **Session Completion**: Upon completing or losing a mission (`POST /api/games/:sessionId/complete`), gameplay metrics (time elapsed, enemies killed, bosses slain, damage taken) are evaluated on the backend against theoretical mathematical bounds.
4. **Atomic Ledger Entries**: Every currency change records an immutable `WalletTransaction` with balance before, balance after, reference ID, and transaction type.

## 3. Rewarded Advertising Mechanics
- **Ad Opportunities Lifecycle**: `OFFERED` ➔ `REQUESTED` ➔ `AD_STARTED` ➔ `AD_COMPLETED` ➔ `VERIFYING` ➔ `VERIFIED` ➔ `GRANTED`
- **Supported Ad Placements**:
  1. `REVIVE`: 1 per mission. Restores 50% HP at current wave checkpoint.
  2. `DOUBLE_CREDITS`: Multiplies earned mission credits by 2x (max 1 claim per completed mission).
  3. `DOUBLE_SCORE`: Multiplies mission score by 2x for leaderboard ranking (max 1 claim per completed mission).
  4. `EMERGENCY_SHIELD`: Grants a 10-second defensive shield before hard waves.
- **Fairness & Frequency Caps**:
  - Max 5 rewarded ads per session.
  - Max 10 rewarded ads per day.
  - 30-second minimum cooldown between ad requests.
  - No ads during active combat or unavoidable loops.
- **Provider Abstraction**: A modular `AdProviderAdapter` pattern is used. A labelled `SimulatedAdAdapter` is provided for zero-friction local development and automated testing, with a clear drop-in interface for production SDKs (AdMob, Unity Ads, etc.).
