/**
 * SPACE SHOOTER ODYSSEY — 5 Sectors & 50 Full Data-Driven Playable Missions
 */

export const SECTORS = [
  {
    id: 'orion-frontier',
    name: 'Sector 1: Orion Frontier',
    description: 'The outermost defensive perimeter of human-settled space. Light skirmishes against scout vanguard fleets.',
    bgColor: '#030712',
    accentColor: '#38bdf8',
    gradient: 'from-cyan-950 via-slate-950 to-black',
    missionRange: [1, 10],
    requiredStars: 0,
    bossName: 'The Iron Warden',
    bossMissionId: 'm-10',
  },
  {
    id: 'crimson-nebula',
    name: 'Sector 2: Crimson Nebula',
    description: 'A volatile ionized gas cloud harboring rogue alien bio-constructs and hyper-aggressive interceptors.',
    bgColor: '#0f0508',
    accentColor: '#f43f5e',
    gradient: 'from-rose-950 via-zinc-950 to-black',
    missionRange: [11, 20],
    requiredStars: 15,
    bossName: 'Nebula Serpent',
    bossMissionId: 'm-20',
  },
  {
    id: 'frozen-expanse',
    name: 'Sector 3: Frozen Expanse',
    description: 'Perpetual sub-zero cryogenic asteroid belt. Enemies have heavy thermal absorption plating and long-range railguns.',
    bgColor: '#020d18',
    accentColor: '#06b6d4',
    gradient: 'from-sky-950 via-slate-950 to-black',
    missionRange: [21, 30],
    requiredStars: 35,
    bossName: 'Solar Devourer',
    bossMissionId: 'm-30',
  },
  {
    id: 'rift-territory',
    name: 'Sector 4: Rift Territory',
    description: 'Torn space-time anomalies where dimensional carrier flagships drop continuous swarms of enemy craft.',
    bgColor: '#10061e',
    accentColor: '#a855f7',
    gradient: 'from-purple-950 via-neutral-950 to-black',
    missionRange: [31, 40],
    requiredStars: 60,
    bossName: 'The Rift Carrier',
    bossMissionId: 'm-40',
  },
  {
    id: 'void-citadel',
    name: 'Sector 5: Void Citadel',
    description: 'The dark core fortress of the Void Armada. Maximum difficulty bullet hell battles culminating in the Void Emperor showdown.',
    bgColor: '#090514',
    accentColor: '#ec4899',
    gradient: 'from-fuchsia-950 via-slate-950 to-black',
    missionRange: [41, 50],
    requiredStars: 90,
    bossName: 'Void Emperor',
    bossMissionId: 'm-50',
  },
];

// Generate all 50 distinct missions
export const generateMissions = () => {
  const missions = [];

  for (let i = 1; i <= 50; i++) {
    let sectorId = 'orion-frontier';
    let difficulty = 'beginner';
    let sectorSeq = i;

    if (i <= 10) {
      sectorId = 'orion-frontier';
      difficulty = i <= 5 ? 'tutorial' : 'beginner';
      sectorSeq = i;
    } else if (i <= 20) {
      sectorId = 'crimson-nebula';
      difficulty = 'easy';
      sectorSeq = i - 10;
    } else if (i <= 30) {
      sectorId = 'frozen-expanse';
      difficulty = 'medium';
      sectorSeq = i - 20;
    } else if (i <= 40) {
      sectorId = 'rift-territory';
      difficulty = 'hard';
      sectorSeq = i - 30;
    } else {
      sectorId = 'void-citadel';
      difficulty = 'expert';
      sectorSeq = i - 40;
    }

    const isBossMission = i % 10 === 0;
    let bossId = null;
    let bossName = null;
    if (i === 10) { bossId = 'boss_warden'; bossName = 'The Iron Warden'; }
    else if (i === 20) { bossId = 'boss_serpent'; bossName = 'Nebula Serpent'; }
    else if (i === 30) { bossId = 'boss_solar'; bossName = 'Solar Devourer'; }
    else if (i === 40) { bossId = 'boss_carrier'; bossName = 'The Rift Carrier'; }
    else if (i === 50) { bossId = 'boss_emperor'; bossName = 'Void Emperor'; }

    // Varied objectives across the campaign
    let objectiveType = 'destroy_enemies';
    let targetCount = 10 + i * 2;
    let duration = 30 + Math.floor(i * 1.5);
    let objectiveDesc = `Destroy ${targetCount} hostile vessels`;

    if (isBossMission) {
      objectiveType = 'defeat_boss';
      objectiveDesc = `Survive wave onslaught and defeat ${bossName}`;
    } else if (i % 4 === 2) {
      objectiveType = 'survive_time';
      objectiveDesc = `Survive for ${duration} seconds under constant fire`;
    } else if (i % 4 === 3) {
      objectiveType = 'collect_pickups';
      const itemsReq = 4 + Math.floor(i / 5);
      objectiveDesc = `Collect at least ${itemsReq} combat energy cores or caches`;
    } else if (i % 4 === 0) {
      objectiveType = 'elite_hunt';
      const elitesReq = 1 + Math.floor(i / 15);
      objectiveDesc = `Eliminate ${elitesReq} elite vanguard flagships`;
    }

    // Dynamic wave composition
    const waveCount = isBossMission ? 4 : 2 + Math.floor(i / 12);
    const waves = [];
    for (let w = 1; w <= waveCount; w++) {
      const enemyPool = [];
      // Scouts
      enemyPool.push({ type: 'scout', count: 4 + Math.floor(i / 3) });
      // Interceptors
      if (i > 8) {
        enemyPool.push({ type: 'interceptor', count: 2 + Math.floor(i / 6) });
      }
      // Cruisers
      if (i > 18) {
        enemyPool.push({ type: 'cruiser', count: 1 + Math.floor(i / 14) });
      }
      // Gunships
      if (i > 28) {
        enemyPool.push({ type: 'gunship', count: 1 + Math.floor(i / 16) });
      }
      // Elites
      if (i > 25 && w === waveCount && !isBossMission) {
        enemyPool.push({ type: 'elite', count: 1 + Math.floor(i / 35) });
      }

      waves.push({
        waveNumber: w,
        spawnIntervalMs: Math.max(1200, 2600 - i * 25),
        enemies: enemyPool,
      });
    }

    // Rewards scaling
    const creditsReward = 100 + i * 25 + (isBossMission ? 350 : 0);
    const xpReward = 50 + i * 15 + (isBossMission ? 200 : 0);
    const energyCoresReward = isBossMission ? 2 : (i % 5 === 0 ? 1 : 0);

    missions.push({
      id: `m-${i}`,
      sequence: i,
      sectorId,
      sectorSequence: sectorSeq,
      title: isBossMission 
        ? `Sector Finale: ${bossName}` 
        : `Mission ${i}: ${getMissionName(i, sectorId)}`,
      difficulty,
      isBossMission,
      bossId,
      bossName,
      objective: {
        type: objectiveType,
        targetCount,
        durationSeconds: duration,
        description: objectiveDesc,
      },
      waves,
      rewards: {
        credits: creditsReward,
        xp: xpReward,
        energyCores: energyCoresReward,
      },
      starRequirements: {
        oneStar: 'Complete primary objective',
        twoStar: `Finish with at least 50% ship hull intact`,
        threeStar: `Score target reached & zero deaths`,
      },
      targetScore: 2500 + i * 800 + (isBossMission ? 10000 : 0),
      unlockRequirement: i === 1 ? null : `m-${i - 1}`,
    });
  }

  return missions;
};

function getMissionName(num, sector) {
  const names = [
    'First Patrol', 'Asteroid Skirmish', 'Deep Space Drift', 'Vanguard Clashes', 'Sensor Sweep',
    'Raider Outpost', 'Ion Flare Incursion', 'Perimeter Defense', 'Escort Passage', 'Ironclad Showdown',
    'Crimson Entry', 'Plasma Storm', 'Bio-Craft Hunt', 'Spore Clouds', 'Ambush in Dust',
    'Reactor Flare', 'Mutated Swarm', 'Nebula Graveyard', 'Serrated Wings', 'Serpent’s Nest',
    'Cryo Gate', 'Absolute Zero', 'Sub-Zero Ambush', 'Glacial Minefield', 'Frostbite Relay',
    'Permafrost Assault', 'Icebound Leviathan', 'Thermal Collapse', 'Blizzard Front', 'Solar Flare Crisis',
    'Torn Space', 'Event Horizon', 'Warp Rift Gate', 'Distortion Waves', 'Singularity Run',
    'Anomaly Probe', 'Carrier Vanguard', 'Null Space Breach', 'Spatial Cascade', 'Hangar Siege',
    'Citadel Approach', 'Obsidian Spire', 'Royal Guard Intercept', 'Dark Core Descent', 'Imperial Battery',
    'Void Crucible', 'Eclipse Bastion', 'Abyssal Throne', 'Shadow Armageddon', 'The Final Odyssey'
  ];
  return names[num - 1] || `Sector Sector Skirmish ${num}`;
}

export const ALL_MISSIONS = generateMissions();
