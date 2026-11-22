import React, { useState } from 'react';
import { DAILY_MISSION_TEMPLATES } from '../data/dailyMissionsData';
import { useGame } from '../context/GameContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Sparkles,
  Crosshair,
  Zap,
  Rocket,
  ShieldCheck,
} from 'lucide-react';

export default function DailyMissionsPage() {
  const { wallet, setWallet } = useGame();
  
  // Track daily progress
  const [claimedDaily, setClaimedDaily] = useState([]);
  const [missionProgress, setMissionProgress] = useState({
    daily_kill_30: 18,
    daily_clear_2: 2,
    daily_kill_elite: 1,
    daily_powerup_3: 3,
  });
  const [notification, setNotification] = useState(null);

  const handleClaim = (mission) => {
    if (claimedDaily.includes(mission.id)) return;

    setClaimedDaily((prev) => [...prev, mission.id]);
    setWallet((prev) => ({
      ...prev,
      credits: prev.credits + mission.reward.credits,
      xp: prev.xp + mission.reward.xp,
      energyCores: prev.energyCores + (mission.reward.energyCores || 0),
    }));

    setNotification(`Successfully claimed reward for ${mission.title}! +${mission.reward.credits} CR, +${mission.reward.xp} XP`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-2 border border-cyan-500/30">
            <Calendar className="w-3.5 h-3.5" />
            <span>24-Hour Orbital Directives</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            DAILY MISSIONS & OBJECTIVES
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Complete daily fleet orders to secure recurring credit bounties, military XP, and rare progression cores.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next Cycle Reset: 09:44:12</span>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Daily Directives List */}
      <div className="space-y-4">
        {DAILY_MISSION_TEMPLATES.map((m) => {
          const currentVal = missionProgress[m.id] || 0;
          const isComplete = currentVal >= m.target;
          const isClaimed = claimedDaily.includes(m.id);
          const percent = Math.min(100, Math.floor((currentVal / m.target) * 100));

          return (
            <div
              key={m.id}
              className={`sci-fi-panel p-5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isClaimed
                  ? 'border-slate-800/80 bg-slate-950/40 opacity-70'
                  : isComplete
                  ? 'border-emerald-500/40 bg-emerald-950/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'border-slate-800'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-base text-white">
                    {m.title}
                  </h3>
                  {isClaimed ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold uppercase">
                      Claimed
                    </span>
                  ) : isComplete ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold uppercase border border-emerald-500/40">
                      Ready To Claim
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 font-bold uppercase">
                      In Progress
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300">
                  {m.description}
                </p>

                {/* Progress Bar */}
                <div className="max-w-md pt-2 space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Progress:</span>
                    <span className={isComplete ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                      {currentVal} / {m.target} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isComplete ? 'bg-emerald-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Rewards & Button */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0">
                <div className="text-right text-xs font-mono">
                  <span className="text-amber-300 font-bold block">+{m.reward.credits} CR</span>
                  <span className="text-cyan-400 font-bold block">+{m.reward.xp} XP</span>
                  {m.reward.energyCores && (
                    <span className="text-purple-300 font-bold block">+{m.reward.energyCores} Core</span>
                  )}
                </div>

                {isClaimed ? (
                  <button
                    disabled
                    className="py-2 px-4 rounded-xl bg-slate-900 text-slate-500 border border-slate-800 text-xs font-mono flex items-center gap-1.5 cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" /> Reward Claimed
                  </button>
                ) : isComplete ? (
                  <button
                    onClick={() => handleClaim(m)}
                    className="py-2 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold font-heading text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Coins className="w-3.5 h-3.5 fill-black" /> Claim Reward
                  </button>
                ) : (
                  <span className="text-xs font-mono text-slate-500">
                    Active In Combat
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
