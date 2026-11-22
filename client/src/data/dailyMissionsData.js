/**
 * SPACE SHOOTER ODYSSEY — Daily Missions & Streak Data
 */

export const DAILY_MISSION_TEMPLATES = [
  {
    id: 'daily_kill_30',
    title: 'Void Exterminator',
    description: 'Destroy 30 enemy vessels across any sectors.',
    target: 30,
    type: 'destroy_enemies',
    reward: { credits: 250, xp: 120 },
  },
  {
    id: 'daily_clear_2',
    title: 'Fleet Deployments',
    description: 'Successfully complete 2 campaign missions.',
    target: 2,
    type: 'complete_missions',
    reward: { credits: 300, xp: 150 },
  },
  {
    id: 'daily_kill_elite',
    title: 'High-Value Target',
    description: 'Eliminate 1 elite enemy flagship in combat.',
    target: 1,
    type: 'kill_elite',
    reward: { credits: 350, xp: 180, energyCores: 1 },
  },
  {
    id: 'daily_powerup_3',
    title: 'Tactical Overload',
    description: 'Activate 3 combat power-ups during gameplay.',
    target: 3,
    type: 'use_powerup',
    reward: { credits: 200, xp: 100 },
  },
];

export const DAILY_STREAK_CALENDAR = [
  { day: 1, reward: { credits: 150, xp: 50 } },
  { day: 2, reward: { credits: 250, xp: 100 } },
  { day: 3, reward: { credits: 350, xp: 150, energyCores: 1 } },
  { day: 4, reward: { credits: 500, xp: 200 } },
  { day: 5, reward: { credits: 700, xp: 300, energyCores: 1 } },
  { day: 6, reward: { credits: 1000, xp: 450, energyCores: 2 } },
  { day: 7, reward: { credits: 2000, xp: 1000, energyCores: 5 } },
];
