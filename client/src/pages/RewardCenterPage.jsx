import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { DAILY_STREAK_CALENDAR } from '../data/dailyMissionsData';
import SimulatedAdModal from '../components/common/SimulatedAdModal';
import {
  Gift,
  Coins,
  Calendar,
  Shield,
  HeartPulse,
  Trophy,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function RewardCenterPage() {
  const { wallet, setWallet, dailyStreak } = useGame();
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState('DOUBLE_CREDITS');
  const [claimedStreakDay, setClaimedStreakDay] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleOpenAd = (placement) => {
    setSelectedPlacement(placement);
    setAdModalOpen(true);
  };

  const handleRewardGranted = (data) => {
    setStatusMsg(`Verified rewarded ad event! 150 Credits added to your wallet.`);
    setWallet((prev) => ({
      ...prev,
      credits: prev.credits + 150,
    }));
  };

  const handleClaimDailyStreak = (dayObj) => {
    if (claimedStreakDay === dayObj.day) return;
    setClaimedStreakDay(dayObj.day);
    setWallet((prev) => ({
      ...prev,
      credits: prev.credits + dayObj.reward.credits,
      xp: prev.xp + dayObj.reward.xp,
      energyCores: prev.energyCores + (dayObj.reward.energyCores || 0),
    }));
    setStatusMsg(`Claimed Day ${dayObj.day} Login Bonus! +${dayObj.reward.credits} Credits & +${dayObj.reward.xp} XP!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-2 border border-cyan-500/30">
            <Gift className="w-3.5 h-3.5" />
            <span>VELoop Rewards Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            REWARD CENTER & AD ECONOMY
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Controlled, sustainable rewarded advertising opportunities and 7-day orbital login calendar.
          </p>
        </div>

        {/* Balance Badge */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-amber-300 font-bold">
          <img src="/assets/pickups/credit_cache.svg" alt="CR" className="w-4 h-4" />
          <span>{wallet.credits.toLocaleString()} Credits</span>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 7-Day Login Streak Calendar */}
      <div className="sci-fi-panel p-6 rounded-2xl border border-cyan-500/30">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h3 className="font-heading font-bold text-lg text-white">
              7-Day Orbital Login Streak
            </h3>
          </div>
          <span className="font-mono text-xs text-rose-400 font-bold">
            Current Streak: Day {dailyStreak}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {DAILY_STREAK_CALENDAR.map((item) => {
            const isToday = item.day === dailyStreak;
            const isClaimed = claimedStreakDay === item.day;
            const isPast = item.day < dailyStreak;

            return (
              <div
                key={item.day}
                className={`p-4 rounded-xl border flex flex-col justify-between text-center transition-all ${
                  isToday
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : isPast || isClaimed
                    ? 'border-slate-800 bg-slate-950/60 opacity-60'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Day {item.day}
                  </span>
                  <div className="text-amber-300 font-bold text-sm font-mono">
                    +{item.reward.credits} CR
                  </div>
                  {item.reward.energyCores && (
                    <div className="text-purple-300 text-[11px] font-mono mt-0.5">
                      +{item.reward.energyCores} Core
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  {isClaimed ? (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      ✓ Claimed
                    </span>
                  ) : isToday ? (
                    <button
                      onClick={() => handleClaimDailyStreak(item)}
                      className="w-full py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-heading font-extrabold text-[11px] transition-all"
                    >
                      Claim
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-600">
                      {isPast ? 'Past' : 'Locked'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rewarded Ad Placements Demonstration */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-mono uppercase text-amber-400 font-bold tracking-widest">
            AUTHENTICATED SPONSOR PIPELINES
          </span>
          <h2 className="text-2xl font-bold font-heading text-white mt-1">
            Rewarded-Ad Placements & Limits
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Rewarded advertising follows strict server-side frequency caps: max 5 ads per session, max 10 ads per day, with 30-second cooldowns to preserve gameplay balance and economy sustainability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revive Placement */}
          <div className="sci-fi-panel p-6 rounded-2xl border border-rose-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-4">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-1">
                Defeat Revive
              </h3>
              <p className="text-xs text-slate-300 mb-3">
                Watch a 5-second broadcast upon ship defeat to resume from wave checkpoint with 60% hull.
              </p>
              <div className="text-[11px] font-mono text-slate-400 space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800 mb-4">
                <div className="flex justify-between"><span>Limit:</span><span className="text-cyan-400">1 per mission</span></div>
                <div className="flex justify-between"><span>Placement:</span><span>REVIVE</span></div>
              </div>
            </div>
            <button
              onClick={() => handleOpenAd('REVIVE')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" /> Test Revive Flow
            </button>
          </div>

          {/* Double Credits Placement */}
          <div className="sci-fi-panel p-6 rounded-2xl border border-amber-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 mb-4">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-1">
                Double Credits
              </h3>
              <p className="text-xs text-slate-300 mb-3">
                Available on mission victory results screen to multiply earned credit bounty by 2x.
              </p>
              <div className="text-[11px] font-mono text-slate-400 space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800 mb-4">
                <div className="flex justify-between"><span>Multiplier:</span><span className="text-amber-400 font-bold">2.0x Credits</span></div>
                <div className="flex justify-between"><span>Placement:</span><span>DOUBLE_CREDITS</span></div>
              </div>
            </div>
            <button
              onClick={() => handleOpenAd('DOUBLE_CREDITS')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" /> Test Double Credits
            </button>
          </div>

          {/* Double Score Placement */}
          <div className="sci-fi-panel p-6 rounded-2xl border border-yellow-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-yellow-950/80 border border-yellow-500/50 flex items-center justify-center text-yellow-400 mb-4">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-1">
                Double Score
              </h3>
              <p className="text-xs text-slate-300 mb-3">
                Doubles verified mission high score submitted to the global competitive leaderboard.
              </p>
              <div className="text-[11px] font-mono text-slate-400 space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800 mb-4">
                <div className="flex justify-between"><span>Multiplier:</span><span className="text-yellow-400 font-bold">2.0x Score</span></div>
                <div className="flex justify-between"><span>Placement:</span><span>DOUBLE_SCORE</span></div>
              </div>
            </div>
            <button
              onClick={() => handleOpenAd('DOUBLE_SCORE')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-yellow-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" /> Test Double Score
            </button>
          </div>

          {/* Emergency Shield Placement */}
          <div className="sci-fi-panel p-6 rounded-2xl border border-cyan-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-1">
                Emergency Shield
              </h3>
              <p className="text-xs text-slate-300 mb-3">
                Grants a complimentary 10-second defensive shield pulse before difficult boss encounters.
              </p>
              <div className="text-[11px] font-mono text-slate-400 space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800 mb-4">
                <div className="flex justify-between"><span>Bonus:</span><span className="text-cyan-400 font-bold">+1 Shield Pulse</span></div>
                <div className="flex justify-between"><span>Placement:</span><span>EMERGENCY_SHIELD</span></div>
              </div>
            </div>
            <button
              onClick={() => handleOpenAd('EMERGENCY_SHIELD')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" /> Test Shield Flow
            </button>
          </div>
        </div>
      </div>

      <SimulatedAdModal
        isOpen={adModalOpen}
        onClose={() => setAdModalOpen(false)}
        placement={selectedPlacement}
        onRewardGranted={handleRewardGranted}
      />

    </div>
  );
}
