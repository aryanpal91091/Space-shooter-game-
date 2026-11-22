import React, { useState } from 'react';
import { ACHIEVEMENTS_DATA } from '../data/achievementsData';
import { useGame } from '../context/GameContext';
import {
  Trophy,
  Star,
  CheckCircle2,
  Lock,
  Coins,
  Sparkles,
  Rocket,
  Shield,
  Crosshair,
  Skull,
  Compass,
  Zap,
  Crown,
} from 'lucide-react';

export default function AchievementsPage() {
  const { wallet, completedMissions, unlockedShips } = useGame();

  const iconMap = {
    Crosshair,
    Trophy,
    Rocket,
    Skull,
    ShieldAlert: Skull,
    Compass,
    Star,
    Shield,
    Zap,
    Crown,
  };

  // Evaluate achievement unlocks from player state
  const completedCount = Object.keys(completedMissions).length;
  const isAce = Object.values(completedMissions).some((m) => m.stars === 3);

  const isUnlocked = (ach) => {
    if (ach.id === 'first_contact' || ach.id === 'first_victory') return completedCount >= 1;
    if (ach.id === 'fleet_recruit') return unlockedShips.length >= 2;
    if (ach.id === 'elite_hunter') return completedCount >= 3;
    if (ach.id === 'boss_breaker') return completedMissions['m-10'] !== undefined;
    if (ach.id === 'sector_explorer') return completedCount >= 10;
    if (ach.id === 'ace_pilot') return isAce;
    if (ach.id === 'shield_specialist') return true;
    if (ach.id === 'power_collector') return true;
    if (ach.id === 'void_conqueror') return completedMissions['m-50'] !== undefined;
    return false;
  };

  const unlockedCount = ACHIEVEMENTS_DATA.filter(isUnlocked).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-2 border border-cyan-500/30">
            <Trophy className="w-3.5 h-3.5" />
            <span>Pilot Honors & Badges</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            CAREER ACHIEVEMENTS
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Battle milestones awarded for tactical combat prowess, fleet expansion, and sector subjugation.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono">
          <span className="text-slate-400">Total Unlocked:</span>
          <span className="text-yellow-400 font-bold">{unlockedCount} / {ACHIEVEMENTS_DATA.length}</span>
        </div>
      </div>

      {/* Grid of 10 Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACHIEVEMENTS_DATA.map((ach) => {
          const unlocked = isUnlocked(ach);
          const Icon = iconMap[ach.icon] || Trophy;

          return (
            <div
              key={ach.id}
              className={`sci-fi-panel p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                unlocked
                  ? 'border-yellow-500/40 bg-yellow-950/10 shadow-[0_0_15px_rgba(250,204,21,0.1)]'
                  : 'border-slate-800 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  unlocked
                    ? 'bg-yellow-950/80 border-yellow-500/50 text-yellow-400'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-base text-white">
                    {ach.title}
                  </h3>
                  {unlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> UNLOCKED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                      <Lock className="w-3.5 h-3.5" /> LOCKED
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300">
                  {ach.description}
                </p>

                <div className="pt-2 flex items-center gap-3 text-xs font-mono">
                  <span className="text-amber-300 font-bold">+{ach.reward.credits} CR</span>
                  <span className="text-cyan-400 font-bold">+{ach.reward.xp} XP</span>
                  {ach.reward.energyCores && (
                    <span className="text-purple-300 font-bold">+{ach.reward.energyCores} Core</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
