import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { SECTORS, ALL_MISSIONS } from '../data/missionsData';
import { useGame } from '../context/GameContext';
import {
  Compass,
  Star,
  Lock,
  Play,
  ArrowLeft,
  Crosshair,
  Skull,
  Coins,
  ShieldAlert,
} from 'lucide-react';

export default function MissionSelectPage() {
  const { sectorId } = useParams();
  const { unlockedMissions, completedMissions } = useGame();

  const sector = SECTORS.find((s) => s.id === sectorId) || SECTORS[0];
  const sectorMissions = ALL_MISSIONS.filter((m) => m.sectorId === sector.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Sector Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <Link
            to="/campaign"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sector Grid
          </Link>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">
            {sector.name}
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            {sector.description}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">Sector Climax:</span>
          <span className="text-rose-400 font-bold flex items-center gap-1">
            <Skull className="w-3.5 h-3.5" /> {sector.bossName}
          </span>
        </div>
      </div>

      {/* 10 Missions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {sectorMissions.map((mission) => {
          const isUnlocked = unlockedMissions.includes(mission.id);
          const completion = completedMissions[mission.id];
          const starsEarned = completion?.stars || 0;

          return (
            <div
              key={mission.id}
              className={`sci-fi-panel p-4 rounded-xl border flex flex-col justify-between transition-all ${
                isUnlocked
                  ? mission.isBossMission
                    ? 'border-rose-500/50 hover:border-rose-400 bg-rose-950/10 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                    : 'border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'border-slate-800 opacity-60'
              }`}
            >
              <div>
                {/* Header: Sequence & Difficulty */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    MSN {mission.sequence}
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      mission.difficulty === 'tutorial' || mission.difficulty === 'beginner'
                        ? 'bg-emerald-950 text-emerald-400'
                        : mission.difficulty === 'easy'
                        ? 'bg-cyan-950 text-cyan-400'
                        : mission.difficulty === 'medium'
                        ? 'bg-amber-950 text-amber-400'
                        : mission.difficulty === 'hard'
                        ? 'bg-purple-950 text-purple-400'
                        : 'bg-rose-950 text-rose-400'
                    }`}
                  >
                    {mission.difficulty}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-heading font-bold text-sm text-white mb-2 line-clamp-1">
                  {mission.title}
                </h3>

                {/* Stars Indicator */}
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3].map((starIndex) => (
                    <Star
                      key={starIndex}
                      className={`w-4 h-4 ${
                        starIndex <= starsEarned
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                  {completion?.bestScore && (
                    <span className="ml-auto font-mono text-[10px] text-slate-400">
                      {completion.bestScore.toLocaleString()} PTS
                    </span>
                  )}
                </div>

                {/* Objective */}
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 mb-3 text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-start gap-1.5 text-cyan-300 font-semibold">
                    <Crosshair className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{mission.objective.description}</span>
                  </div>
                </div>

                {/* Rewards preview */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-4">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Coins className="w-3 h-3" /> +{mission.rewards.credits}
                  </span>
                  <span className="text-cyan-400">
                    +{mission.rewards.xp} XP
                  </span>
                  {mission.rewards.energyCores > 0 && (
                    <span className="text-purple-300 font-bold">
                      +{mission.rewards.energyCores} Core
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isUnlocked ? (
                  <Link
                    to={`/game/${mission.id}`}
                    className={`w-full py-2 px-3 rounded-lg font-heading font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      mission.isBossMission
                        ? 'bg-rose-500 hover:bg-rose-400 text-black shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>{starsEarned > 0 ? 'Replay Mission' : 'Engage Combat'}</span>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 text-slate-600 border border-slate-800 text-xs font-mono flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    <Lock className="w-3.5 h-3.5" /> Locked
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
