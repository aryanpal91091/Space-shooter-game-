<<<<<<< HEAD
# SPACE SHOOTER ODYSSEY

> **VELoop Rewards — Full-Stack Developer Internship Assignment**  
> An original full-stack 2D arcade space shooter with campaign progression, fleet upgrades, 5 colossal bosses, 50 data-driven missions, player accounts, and an audited rewarded-ad economy.

---

## 🌌 1. Project Overview
**SPACE SHOOTER ODYSSEY** is a commercial-grade, responsive full-stack browser game built to satisfy every engineering, game design, anti-cheat, and economic criterion specified in the VELoop Rewards Developer Assignment.

The project features:
- **Game Engine**: Built with Phaser 3.88 featuring true 2D Arcade Physics, custom vector SVG graphics, frame-rate independent movement, enemy AI state machines, and multi-phase boss battles.
- **Frontend App**: Built with React 18, Vite 6, Tailwind CSS, React Router 6, and Lucide Icons.
- **Backend API**: Built with Node.js, Express.js, MongoDB + Mongoose, JWT authentication, bcrypt password hashing, and express-rate-limit.
- **VELoop Rewards Economy**: A strictly authoritative multi-currency model with atomic wallet mutations, immutable audit ledgers, anti-cheat duration and score plausibility validation, and an idempotent rewarded-ad state machine.

---

## 🎮 2. Reference Game Research & Original Identity
- **Reference Inspiration**: Classic space combat arcade shooters like *Space Shooter 2*, *Galaga*, and *Raiden*.
- **Originality & Intellectual Property Guarantee**:
  - 100% original ship vector artwork, original alien enemy designs, original bosses, and custom UI components.
  - Zero proprietary game code, assets, audio files, or logos copied from external mobile APKs.
  - Deep fleet specialization featuring 5 distinct spaceship archetypes (Interceptor, Striker, Guardian, Support Craft, Experimental Ship).
  - Procedural Web Audio API sound synthesizers guaranteeing authentic retro-futuristic acoustic feedback with zero external sound asset dependencies.

---

## 🕹️ 3. Gameplay Controls

### Desktop Controls (Windows 11 / Mac / Linux)
- **Ship Navigation**: `W`, `A`, `S`, `D` or `Arrow Keys`
- **Primary Weapon Discharge**: Automatic firing loop or `Spacebar`
- **Tactical Power-Ups (1–8)**: Numeric keys `1` through `8`
- **Tactical Pause / Resume**: `Escape` key

### Mobile & Tablet Touch Controls
- **Vessel Navigation**: Intuitive touch drag anywhere on the combat canvas
- **Weapons Fire**: Continuous automated combat fire
- **Power-Up Activation**: Responsive touch buttons located on the bottom HUD dock
- **Pause & Resume**: Top HUD pause button

---

## 🚀 4. Spaceship Fleet Classes & Upgrades

| Ship Class | Archetype | Hull HP | Deflector Shield | Velocity | Damage | Primary Weapon | Special Ability |
|------------|-----------|---------|------------------|----------|--------|----------------|-----------------|
| **Aero-V Interceptor** | Balanced Fighter | 100 HP | 50 SHD | 340 px/s | 18 DMG | Twin Plasma Bolters | Emergency Warp (15s cd) |
| **Crimson Valkyrie** | Glass Cannon Striker | 75 HP | 30 SHD | 360 px/s | 26 DMG | Heavy Particle Blaster | Overdrive Burst (20s cd) |
| **Aegis Dreadnought** | Heavy Tank Guardian | 180 HP | 100 SHD | 260 px/s | 22 DMG | Wide Spread Lasers | Shield Pulse (18s cd) |
| **Solaris Harvester** | Support Craft | 120 HP | 60 SHD | 310 px/s | 19 DMG | Ion Pulsar Array | Nano Repair Drone (24s cd) |
| **Void Chimera X-1** | Experimental Prototype | 140 HP | 80 SHD | 340 px/s | 30 DMG | Tachyon Singularity | EMP Blast (22s cd) |

### Ship Upgrades
Each vessel can be calibrated up to **Tier 5** across six attributes:
1. **Weapon Damage**: Increases base bullet damage per tier (+4 to +8 DMG).
2. **Firing Rate**: Decreases delay between consecutive plasma volleys.
3. **Maximum Health**: Bolsters dura-steel hull armor plating (+15 to +35 HP).
4. **Movement Speed**: Increases thruster responsiveness (+15 to +25 px/s).
5. **Shield Capacity**: Expands deflector shield energy reserves (+10 to +25 SHD).
6. **Special Cooldown**: Reduces tactical ability recharge delay (-1.5s to -2.5s).

---

## ⚡ 5. Eight Mandatory Tactical Power-Ups
1. **Shield Pulse**: Deploys an electromagnetic barrier absorbing all incoming damage for 6 seconds.
2. **Rapid Fire**: Overclocks main weapon fire rate by 2.2x for 8 seconds.
3. **Spread Shot**: Fires a 5-way wide dispersion plasma cone for 8 seconds.
4. **Homing Micro-Missiles**: Launches 6 seeking missiles tracking the nearest active enemy target.
5. **EMP Shockwave**: Emits a screen-wide pulse vaporizing all active enemy bullets and damaging all hostiles.
6. **Nano Repair Drone**: Restores 40% maximum hull health over 5 seconds.
7. **Overdrive Matrix**: Increases velocity by +30% and damage yield by +50% for 7 seconds.
8. **Emergency Warp**: Teleports the ship to safe bottom center with 1.5s invulnerability frames.

---

## 🗺️ 6. Campaign: 5 Sectors & 50 Playable Missions

| Sector | Name | Difficulty Range | Climax Boss Encounter | Required Stars |
|--------|------|------------------|-----------------------|----------------|
| **Sector 1** | Orion Frontier | Missions 1–10 (Beginner) | **The Iron Warden** (Mission 10) | 0 Stars |
| **Sector 2** | Crimson Nebula | Missions 11–20 (Easy) | **Nebula Serpent** (Mission 20) | 15 Stars |
| **Sector 3** | Frozen Expanse | Missions 21–30 (Medium) | **Solar Devourer** (Mission 30) | 35 Stars |
| **Sector 4** | Rift Territory | Missions 31–40 (Hard) | **The Rift Carrier** (Mission 40) | 60 Stars |
| **Sector 5** | Void Citadel | Missions 41–50 (Expert) | **Void Emperor** (Mission 50) | 90 Stars |

### Objective Types
- `destroy_enemies`: Eliminate a designated number of hostile craft.
- `survive_time`: Survive high-intensity waves for a defined duration.
- `defeat_boss`: Survive escort waves and neutralize the sector titan.
- `elite_hunt`: Eliminate heavily armored elite flagships.
- `collect_pickups`: Gather required combat energy caches.

---

## 💰 7. VELoop Rewarded-Ad Economy & Currencies

### Currency Separation
1. **Credits (CR)**: Standard in-game currency earned from missions and daily activities. Sunk into ship upgrades and armory power-ups.
2. **Energy Cores**: Rare progression tokens awarded exclusively from boss defeats and sector completions. Used to unlock advanced vessels.
3. **Pilot XP**: Progression metric dictating military clearance level.
4. **VELoop Reward Coins**: Platform-eligible reward tokens strictly segregated from virtual tokens.

### Rewarded Ad Placements
- **Revive After Defeat**: Watch a 5s transmission to continue from checkpoint with 60% hull (Max 1 per mission).
- **Double Credits**: Multiplies victory credits by 2.0x on the results screen (Max 1 claim per completed mission).
- **Double Score**: Multiplies mission score by 2.0x for competitive leaderboard ranking (Max 1 claim per completed mission).
- **Emergency Shield**: Grants a complimentary shield pulse module before tough combat.

### Fraud Prevention & Anti-Cheat
- **Frequency Caps**: Max 5 rewarded ads per session, max 10 per day, with 30-second cooldowns.
- **Idempotency**: Every ad claim is tied to an authoritative `AdOpportunity` token. Replayed requests or duplicate callbacks are safely rejected without granting duplicate currency.
- **Server Plausibility Bounds**: Impossible mission completion times (< 3 seconds) or impossible scores (> 250,000 pts) are rejected.
- **Simulated Ad Provider**: A clearly labelled `SimulatedAdAdapter` is provided for local development and testing, with an extensible adapter interface for production networks.

---

## ⚙️ 8. Dynamic Configuration (.env)

The game title is configurable through environment variables with zero code changes required.

### Frontend (`client/.env`)
```bash
VITE_GAME_NAME=SPACE SHOOTER ODYSSEY
VITE_API_URL=http://localhost:5000/api
```

### Backend (`server/.env`)
```bash
PORT=5000
NODE_ENV=development
GAME_NAME=SPACE SHOOTER ODYSSEY
CLIENT_URL=http://localhost:5173
MONGODB_URI=
JWT_SECRET=odyssey_super_secret_jwt_key_2026_dev
```

*Note*: If `MONGODB_URI` is left empty or local MongoDB is unavailable, the backend automatically initializes an embedded in-memory MongoDB server, guaranteeing an immediate zero-configuration startup!

---

## 🛠️ 9. Local Setup & Execution (Windows 11)

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- Git

### Step-by-Step Instructions

1. **Clone or Open Project**:
   ```powershell
   cd c:\Users\lenovo\OneDrive\Desktop\interns
   ```

2. **Run Backend Server**:
   ```powershell
   cd server
   npm run dev
   ```
   *The server will start on `http://localhost:5000`.*

3. **Run Frontend Client** (in a second terminal):
   ```powershell
   cd client
   npm run dev
   ```
   *The client will start on `http://localhost:5173`.*

4. **Open in Browser**:
   Navigate to `http://localhost:5173` to explore the game.

---

## 🧪 10. Automated Testing

The backend includes a comprehensive Vitest test suite verifying:
- Pilot Registration & Password Hashing
- JWT Authentication & Route Protection
- Atomic Wallet Debits, Credits, and Negative Balance Prevention
- Rewarded-Ad Opportunity Lifecycle, State Transitions, and Idempotency
- Game Session Initialization, Single-Use Finalization, and Anti-Cheat Bounds

Run tests:
```powershell
cd server
npm test
```
**Test Result**: 20/20 Tests Passing.

---

## 🚢 11. Deployment Guide

### Frontend Deployment (Vercel)
1. Push repository to GitHub.
2. In Vercel, import repository and set Root Directory to `client`.
3. Add Environment Variable:
   - `VITE_GAME_NAME`: `SPACE SHOOTER ODYSSEY`
   - `VITE_API_URL`: Your deployed backend URL + `/api`
4. Deploy!

### Backend Deployment (Render)
1. In Render, create a new Web Service pointing to repository root.
2. Set Root Directory to `server`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `GAME_NAME`: `SPACE SHOOTER ODYSSEY`
   - `CLIENT_URL`: Your Vercel frontend URL
   - `JWT_SECRET`: Random secure string
   - `MONGODB_URI`: MongoDB Atlas connection URI

---

## 📹 12. Mandatory Demo Video Checklist
1. Landing page with dynamic title `{GAME_NAME}`
2. Pilot registration and authentication
3. Player dashboard with live credits and XP
4. Spaceship hangar with 5 ships and stats
5. Ship upgrade refit modifying gameplay
6. Campaign sector map (5 sectors)
7. Mission selection (50 data-driven missions)
8. Real Phaser combat: player movement and weapon firing
9. Enemy waves and AI behaviors
10. Combat pickup collection
11. Tactical power-up activation (Shield Pulse, EMP, Missiles)
12. Boss encounter with boss health bar and phases
13. Mission victory with 3-star rating
14. Player defeat and "Watch Ad & Revive" flow
15. Double Credits rewarded ad offer
16. Wallet transaction audit ledger
17. Daily missions and 7-day login streak
18. Career achievements (10 badges)
19. Global competitive leaderboard
20. Responsive desktop and mobile gameplay

---

## 📜 13. License
Developed for the **VELoop Rewards Full-Stack Developer Internship Assignment**. All original code and assets are licensed under the MIT License.
=======
# Space-shooter-game-
>>>>>>> db66f931574ba181e955c1043a39595aba85b3c7
