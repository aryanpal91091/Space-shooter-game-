import React from 'react';
import { Link } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { SHIPS_DATA } from '../data/shipsData';
import { SECTORS, ALL_MISSIONS } from '../data/missionsData';
import {
  Rocket,
  Compass,
  Trophy,
  Zap,
  Calendar,
  Gift,
  Shield,
  Star,
  Play,
  ArrowRight,
  TrendingUp,
  Coins,
  Crosshair,
  Flame,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    wallet,
    selectedShipId,
    unlockedShips,
    unlockedMissions,
    completedMissions,
    dailyStreak,
  } = useGame();

  const activeShip = SHIPS_DATA.find((s) => s.id === selectedShipId) || SHIPS_DATA[0];

  // Calculate campaign statistics
  const completedCount = Object.keys(completedMissions).length;
  const totalStars = Object.values(completedMissions).reduce((acc, curr) => acc + (curr.stars || 0), 0);
  const bestScore = Object.values(completedMissions).reduce((max, curr) => Math.max(max, curr.bestScore || 0), 0);

  // Next available mission
  const nextMissionNumber = unlockedMissions.length;
  const nextMission = ALL_MISSIONS.find((m) => m.id === `m-${nextMissionNumber}`) || ALL_MISSIONS[0];

  // Active sector
  const currentSector = SECTORS.find((sec) => sec.id === nextMission.sectorId) || SECTORS[0];

  // XP calculation
  const xpNeeded = wallet.level * 500;
  const xpPercent = Math.min(100, Math.floor(((wallet.xp % 500) / 500) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Pilot Welcome Banner */}
      <div className="sci-fi-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 text-xs font-mono font-bold uppercase border border-cyan-500/40">
              Clearance Level {wallet.level} Pilot
            </span>
            <span className="text-slate-400 text-xs font-mono">
              Call-sign: <span className="text-white font-bold">{user?.username}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">
            COMMAND BRIDGE — <span className="text-cyan-400 glow-cyan">{GAME_NAME}</span>
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Sector deployment is active. Review fleet readiness, upgrade vessel combat arrays, and prepare for next orbital engagement.
          </p>
        </div>

        {/* Quick Launch CTA */}
        <Link
          to={`/game/${nextMission.id}`}
          className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold font-heading text-base shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-black" />
          <span>Deploy: {nextMission.title}</span>
        </Link>
      </div>

      {/* Key Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Credits */}
        <div className="sci-fi-panel p-4 rounded-xl border border-amber-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <img src="/assets/pickups/credit_cache.svg" alt="CR" className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Available Credits</span>
            <h3 className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
              {wallet.credits.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Energy Cores */}
        <div className="sci-fi-panel p-4 rounded-xl border border-purple-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <img src="/assets/pickups/energy_core.svg" alt="Cores" className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Energy Cores</span>
            <h3 className="text-xl sm:text-2xl font-bold font-mono text-purple-300">
              {wallet.energyCores}
            </h3>
          </div>
        </div>

        {/* Stars Earned */}
        <div className="sci-fi-panel p-4 rounded-xl border border-yellow-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-yellow-950/80 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
            <Star className="w-6 h-6 fill-yellow-400" />
          </div>
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Campaign Stars</span>
            <h3 className="text-xl sm:text-2xl font-bold font-mono text-yellow-300">
              {totalStars} / 150
            </h3>
          </div>
        </div>

        {/* Daily Streak */}
        <div className="sci-fi-panel p-4 rounded-xl border border-rose-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Flame className="w-6 h-6 text-rose-400 fill-rose-500" />
          </div>
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Login Streak</span>
            <h3 className="text-xl sm:text-2xl font-bold font-mono text-rose-300">
              Day {dailyStreak}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Selected Ship & Campaign Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Active Flagship Summary */}
        <div className="sci-fi-panel p-6 rounded-2xl border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold uppercase text-cyan-400">
                ACTIVE FLAGSHIP
              </span>
              <span className="text-xs font-mono text-slate-400">
                {unlockedShips.length} of 5 Ships Unlocked
              </span>
            </div>

            <div className="py-6 text-center">
              <div className="relative w-36 h-36 mx-auto mb-4 flex items-center justify-center">
                <div className="absolute inset-0 bg-cyan-500/15 rounded-full blur-xl" />
                <img
                  src={activeShip.image}
                  alt={activeShip.name}
                  className="w-28 h-28 object-contain relative z-10"
                />
              </div>
              <h3 className="text-xl font-bold font-heading text-white">{activeShip.name}</h3>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 text-xs font-mono mt-1">
                Class: {activeShip.class}
              </span>
              <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                {activeShip.description}
              </p>
            </div>

            {/* Ship Stats Bars */}
            <div className="space-y-2.5 font-mono text-xs border-t border-slate-800 pt-4">
              <div className="flex justify-between items-center text-slate-400">
                <span>Hull Armor:</span>
                <span className="text-emerald-400 font-bold">{activeShip.stats.health} HP</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Energy Shield:</span>
                <span className="text-cyan-400 font-bold">{activeShip.stats.shield} SHD</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Thruster Velocity:</span>
                <span className="text-sky-400 font-bold">{activeShip.stats.speed} px/s</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Special Ability:</span>
                <span className="text-purple-400 font-bold">{activeShip.specialAbility.name}</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link
              to="/hangar"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold font-heading flex items-center justify-center gap-1.5 transition-colors"
            >
              <Rocket className="w-4 h-4 text-cyan-400" />
              Configure Hangar Fleet
            </Link>
          </div>
        </div>

        {/* Center / Right: Campaign & Sector Tracker */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Sector Card */}
          <div className="sci-fi-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold uppercase text-purple-400">
                CURRENT CAMPAIGN FRONT
              </span>
              <span className="text-xs font-mono text-slate-400">
                Missions {currentSector.missionRange[0]}–{currentSector.missionRange[1]}
              </span>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold font-heading text-white">
                  {currentSector.name}
                </h3>
                <p className="text-sm text-slate-300 mt-1 max-w-lg">
                  {currentSector.description}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Crosshair className="w-3.5 h-3.5" /> Sector Boss: {currentSector.bossName}
                  </span>
                  <span className="flex items-center gap-1 text-yellow-300">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" /> Stars Required: {currentSector.requiredStars}
                  </span>
                </div>
              </div>

              <Link
                to={`/campaign/${currentSector.id}`}
                className="px-5 py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-heading font-bold transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>Sector Map</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Operations Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Daily Missions Shortcut */}
            <Link
              to="/daily"
              className="sci-fi-panel p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex items-start gap-4 group"
            >
              <div className="p-3 rounded-lg bg-slate-900 group-hover:bg-cyan-950 text-cyan-400 border border-slate-800 transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                  Daily Operations
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Complete daily target goals for bonus Credits, XP, and login calendar streaks.
                </p>
              </div>
            </Link>

            {/* Rewarded Ad Center Shortcut */}
            <Link
              to="/rewards"
              className="sci-fi-panel p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex items-start gap-4 group"
            >
              <div className="p-3 rounded-lg bg-slate-900 group-hover:bg-purple-950 text-purple-400 border border-slate-800 transition-colors">
                <Gift className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-bold text-base text-white group-hover:text-purple-300 transition-colors">
                  Reward Center
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Audit verified rewarded transmissions, claim double-credit vouchers, and test ad adapters.
                </p>
              </div>
            </Link>

            {/* Power-up Inventory Shortcut */}
            <Link
              to="/powerups"
              className="sci-fi-panel p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex items-start gap-4 group"
            >
              <div className="p-3 rounded-lg bg-slate-900 group-hover:bg-emerald-950 text-emerald-400 border border-slate-800 transition-colors">
                <Zap className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                  Power-Up Armory
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Acquire 8 tactical combat modules: Shield Pulse, Homing Missiles, EMP, and Overdrive.
                </p>
              </div>
            </Link>

            {/* Leaderboard Shortcut */}
            <Link
              to="/leaderboard"
              className="sci-fi-panel p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex items-start gap-4 group"
            >
              <div className="p-3 rounded-lg bg-slate-900 group-hover:bg-amber-950 text-amber-400 border border-slate-800 transition-colors">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                  Global Leaderboard
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  View verified high scores from authenticated game sessions and check your rank.
                </p>
              </div>
            </Link>

          </div>

          {/* Level Progress Bar */}
          <div className="sci-fi-panel p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-400">PILOT LEVEL PROGRESSION</span>
              <span className="text-cyan-400 font-bold">LVL {wallet.level} ({wallet.xp} XP)</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
