# SPACE SHOOTER ODYSSEY — GAME DESIGN DOCUMENT

## 1. Reference Research & Originality
- **Genre**: 2D Arcade Space Shooter / Bullet Hell / Vertical Scrolling Combat with Fleet Progression.
- **Inspiration**: Classic arcade shooters like *Space Shooter 2*, *Galaga*, and *Raiden*, updated for modern web browsers.
- **Key Differences & Original Identity**:
  1. **Proprietary Fleet Progression**: 5 distinct craft archetypes (Interceptor, Striker, Guardian, Support Craft, Experimental Ship) featuring unique handling curves, cooldowns, and special combat modules.
  2. **Data-Driven 50-Mission Campaign**: Spanning 5 unique sectors across deep space with distinct visual identities, mechanics, and 5 hand-crafted original boss encounters.
  3. **Sustainable VELoop Rewarded Ad Economy**: Integrates non-intrusive, optional rewarded advertising opportunities (Revive, Double Credits, Double Score, Emergency Shield) strictly verified via server-side session tokens with strict caps and cooldowns.
  4. **No Pay-To-Win Exploits**: Currency distribution is bounded by authoritative server validation, preventing arbitrary client-side injection.

## 2. Core Gameplay Loop
```
Select Ship & Loadout 
   │
   ▼
Enter Mission / Sector 
   │
   ▼
Evade Projectiles & Engage Waves 
   │
   ▼
Collect Dynamic Pickups & Trigger Power-Ups
   │
   ▼
Boss Showdown (Every 10th Mission)
   │
   ▼
Mission Victory / Defeat
   │
   ▼
Authoritative Reward Calculation & 3-Star Rating
   │
   ▼
Fleet Upgrades & Mission Unlocks in Hangar
```

## 3. Spaceship Fleet Archetypes
| Ship Class | Playstyle | Health | Shield | Speed | Fire Rate | Primary Weapon | Special Ability |
|------------|-----------|--------|--------|-------|-----------|----------------|-----------------|
| **Interceptor** | Balanced / Agile | 100 | 50 | 320 px/s | 0.22s | Twin Plasma Bolters | Emergency Warp (15s cd) |
| **Striker** | Glass Cannon | 75 | 25 | 340 px/s | 0.16s | Heavy Particle Cannon | Overdrive Burst (20s cd) |
| **Guardian** | Heavy Armor Tank | 180 | 100 | 250 px/s | 0.28s | Wide Spread Laser | Shield Pulse (18s cd) |
| **Support Craft**| Resource Magnet | 110 | 60 | 300 px/s | 0.24s | Ion Pulsar | Repair Drone (25s cd) |
| **Experimental Ship**| Tech Exotic | 130 | 80 | 330 px/s | 0.18s | Tachyon Beams | EMP Blast (22s cd) |

## 4. Enemy Categories & AI Behaviors
1. **Scout Fighter**: Fast linear dives and light single-bolt attacks. Easy fodder, high frequency.
2. **Interceptor**: Fast strafing zig-zag patterns with dual-angle shots.
3. **Armored Cruiser**: High HP, slow methodical advance, fires heavy explosive bursts.
4. **Long-Range Gunship**: Stays at the top quadrant of the screen, tracking the player with precision railgun pulses.
5. **Elite Enemy**: Armored, dynamic orbiting, fires helical bullet patterns, drops valuable combat pickups.

## 5. Five Original Boss Encounters
1. **The Iron Warden (Sector 1 - Mission 10)**: Heavy dreadnought with front-shielded armor and twin Gatling batteries. Phase 2 unleashes sweeping laser sweeps.
2. **Nebula Serpent (Sector 2 - Mission 20)**: Multi-segmented biomechanical craft with undulating sine-wave movement and venom-plasma spreads.
3. **Solar Devourer (Sector 3 - Mission 30)**: Energy-absorbing core that releases radiating solar flares and orbital fire rings.
4. **The Rift Carrier (Sector 4 - Mission 40)**: Massive carrier ship deploying waves of interceptor drones while maintaining homing missile salvos.
5. **Void Emperor (Sector 5 - Mission 50)**: Dimensional flagship with 3 progressive phases: Phase 1 (Gravity wells), Phase 2 (Spread barrage), Phase 3 (Void storm hyper-beam).

## 6. Power-Up Mechanics (8 Mandatory Combat Systems)
1. **Shield Pulse**: Grants 6 seconds of complete projectile and collision immunity with visual cyan energy barrier.
2. **Rapid Fire**: 2x attack speed multiplier for 8 seconds.
3. **Spread Shot**: Fires a 5-way projectile spread cone for 8 seconds.
4. **Homing Missiles**: Fires 6 micro-missiles seeking the highest-priority enemy on screen.
5. **EMP Blast**: Emits an electromagnetic shockwave destroying all active enemy projectiles and paralyzing enemies for 3.5s.
6. **Repair Drone**: Deploys an automated repair unit restoring 35% ship hull over 5 seconds.
7. **Overdrive**: Boosts speed (+30%) and weapon damage (+50%) for 7 seconds.
8. **Emergency Warp**: Instantly repositions ship to safe bottom center with 1.5s invulnerability.
