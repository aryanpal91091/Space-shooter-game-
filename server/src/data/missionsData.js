/**
 * SPACE SHOOTER ODYSSEY — 5 Sectors & 50 Full Data-Driven Playable Missions (Server Master Data)
 */

export const SECTORS = [
  {
    id: 'orion-frontier',
    name: 'Sector 1: Orion Frontier',
    description: 'The outermost defensive perimeter of human-settled space. Light skirmishes against scout vanguard fleets.',
    missionRange: [1, 10],
    requiredStars: 0,
    bossName: 'The Iron Warden',
    bossMissionId: 'm-10',
  },
  {
    id: 'crimson-nebula',
    name: 'Sector 2: Crimson Nebula',
    description: 'A volatile ionized gas cloud harboring rogue alien bio-constructs and hyper-aggressive interceptors.',
    missionRange: [11, 20],
    requiredStars: 15,
    bossName: 'Nebula Serpent',
    bossMissionId: 'm-20',
  },
  {
    id: 'frozen-expanse',
    name: 'Sector 3: Frozen Expanse',
    description: 'Perpetual sub-zero cryogenic asteroid belt. Enemies have heavy thermal absorption plating and long-range railguns.',
    missionRange: [21, 30],
    requiredStars: 35,
    bossName: 'Solar Devourer',
    bossMissionId: 'm-30',
  },
  {
    id: 'rift-territory',
    name: 'Sector 4: Rift Territory',
    description: 'Torn space-time anomalies where dimensional carrier flagships drop continuous swarms of enemy craft.',
    missionRange: [31, 40],
    requiredStars: 60,
    bossName: 'The Rift Carrier',
    bossMissionId: 'm-40',
  },
  {
    id: 'void-citadel',
    name: 'Sector 5: Void Citadel',
    description: 'The dark core fortress of the Void Armada. Maximum difficulty bullet hell battles culminating in the Void Emperor showdown.',
    missionRange: [41, 50],
    requiredStars: 90,
    bossName: 'Void Emperor',
    bossMissionId: 'm-50',
  },
];

export const generateMissions = () => {
  const missions = [];

  for (let i = 1; i <= 50; i++) {
    let sectorId = 'orion-frontier';
    let difficulty = 'tutorial';
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

    if (isBossMission) {
      if (i === 10) { bossId = 'boss_warden'; bossName = 'The Iron Warden'; }
      else if (i === 20) { bossId = 'boss_serpent'; bossName = 'Nebula Serpent'; }
      else if (i === 30) { bossId = 'boss_solar'; bossName = 'Solar Devourer'; }
      else if (i === 40) { bossId = 'boss_carrier'; bossName = 'The Rift Carrier'; }
      else if (i === 50) { bossId = 'boss_emperor'; bossName = 'Void Emperor'; }
    }

    let objectiveType = 'destroy_enemies';
    let targetCount = 10 + i * 2;
    let duration = 0;
    let objectiveDesc = `Destroy ${targetCount} hostile vessels`;

    if (isBossMission) {
      objectiveType = 'defeat_boss';
      targetCount = 1;
      objectiveDesc = `Defeat flagship boss ${bossName}`;
    } else if (i % 7 === 0) {
      objectiveType = 'survive_duration';
      duration = 35 + (i % 5) * 5;
      targetCount = 0;
      objectiveDesc = `Survive intense ambush for ${duration} seconds`;
    } else if (i % 5 === 0) {
      objectiveType = 'destroy_elite';
      targetCount = Math.min(5, Math.floor(i / 10) + 1);
      objectiveDesc = `Neutralize ${targetCount} high-threat Elite Commanders`;
    } else if (i % 3 === 0) {
      objectiveType = 'collect_pickups';
      targetCount = 6 + Math.floor(i / 8);
      objectiveDesc = `Secure ${targetCount} tactical supply caches`;
    }

    const wavesCount = isBossMission ? 3 : 2 + Math.floor(i / 15);
    const waves = [];
    for (let w = 1; w <= wavesCount; w++) {
      const enemyPool = [];
      const scoutCount = Math.max(3, 8 - Math.floor(i / 10));
      enemyPool.push({ type: 'scout', count: scoutCount });

      if (i > 8) {
        enemyPool.push({ type: 'interceptor', count: 3 + Math.floor(i / 12) });
      }
      if (i > 18) {
        enemyPool.push({ type: 'cruiser', count: 2 + Math.floor(i / 15) });
      }
      if (i > 28) {
        enemyPool.push({ type: 'gunship', count: 2 + Math.floor(i / 20) });
      }
      if (i > 38 || (i % 5 === 0 && !isBossMission)) {
        enemyPool.push({ type: 'elite', count: 1 + Math.floor(i / 35) });
      }

      waves.push({
        waveNumber: w,
        spawnIntervalSeconds: Math.max(1.5, 3.2 - (i * 0.03)),
        enemies: enemyPool,
      });
    }

    const baseCredits = 80 + i * 25;
    const baseXP = 40 + i * 15;
    const creditsReward = isBossMission ? baseCredits * 3 : baseCredits;
    const xpReward = isBossMission ? baseXP * 2.5 : baseXP;
    const energyCoresReward = isBossMission ? Math.floor(i / 10) + 1 : (i % 5 === 0 ? 1 : 0);

    missions.push({
      id: `m-${i}`,
      sequence: i,
      sectorId,
      sectorSequence: sectorSeq,
      title: isBossMission 
        ? `Sector Finale: ${bossName}` 
        : `Mission ${i}: ${getMissionName(i)}`,
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
      targetScore: 2500 + i * 800 + (isBossMission ? 10000 : 0),
      unlockRequirement: i === 1 ? null : `m-${i - 1}`,
    });
  }

  return missions;
};

function getMissionName(num) {
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
