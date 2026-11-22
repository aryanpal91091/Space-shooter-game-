import React from 'react';
import { Link } from 'react-router-dom';
import { SECTORS } from '../data/missionsData';
import { useGame } from '../context/GameContext';
import { Compass, Star, Lock, ShieldCheck, ArrowRight, Skull } from 'lucide-react';

export default function CampaignPage() {
  const { completedMissions } = useGame();

  const totalStars = Object.values(completedMissions).reduce((acc, curr) => acc + (curr.stars || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Campaign Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono uppercase tracking-widest">
          <Compass className="w-3.5 h-3.5" />
          <span>Star Fleet Galactic Starmap</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
          CAMPAIGN SECTORS
        </h1>
        <p className="text-slate-300 text-sm sm:text-base">
          50 combat operations spread across 5 strategic sectors. Earn campaign stars to pierce deep enemy space and breach the Void Citadel.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-yellow-400 font-mono text-sm">
          <Star className="w-4 h-4 fill-yellow-400" />
          <span>Your Fleet Starlight: <strong>{totalStars}</strong> Stars</span>
        </div>
      </div>

      {/* 5 Sectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECTORS.map((sector, index) => {
          const isUnlocked = totalStars >= sector.requiredStars;
          const starsNeeded = sector.requiredStars - totalStars;

          return (
            <div
              key={sector.id}
              className={`sci-fi-panel p-6 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                isUnlocked
                  ? 'border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                  : 'border-slate-800 opacity-70 grayscale-[0.5]'
              }`}
            >
              {/* Top Accent Gradient Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r"
                style={{ backgroundColor: sector.accentColor }}
              />

              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">
                    SECTOR 0{index + 1}
                  </span>
                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" /> ACCESSIBLE
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400">
                      <Lock className="w-3.5 h-3.5" /> LOCKED ({starsNeeded} STARS NEEDED)
                    </span>
                  )}
                </div>

                <div className="py-4">
                  <h3 className="text-2xl font-bold font-heading text-white mb-2">
                    {sector.name}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {sector.description}
                  </p>

                  <div className="space-y-2 text-xs font-mono bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-slate-400">
                      <span>Missions Range:</span>
                      <span className="text-cyan-300 font-bold">
                        Mission {sector.missionRange[0]} to {sector.missionRange[1]}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Climax Boss:</span>
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <Skull className="w-3 h-3" /> {sector.bossName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                {isUnlocked ? (
                  <Link
                    to={`/campaign/${sector.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold font-heading text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Deploy To Sector Operations</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-slate-500 border border-slate-800 text-xs font-mono flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    <Lock className="w-3.5 h-3.5" /> Requires {sector.requiredStars} Stars
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
