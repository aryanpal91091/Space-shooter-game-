import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  Coins,
  Gift,
  RefreshCw,
  Terminal,
} from 'lucide-react';

export default function AdminEconomyPage() {
  const [metrics, setMetrics] = useState({
    totalAdOpportunities: 142,
    completedRewardedAds: 128,
    completionRate: 90.1,
    creditsGranted: 34500,
    creditsSpent: 28200,
    reviveConversion: 68.4,
    doubleCreditsConversion: 82.5,
    rewardRejectionCount: 3,
  });

  const [recentEvents, setRecentEvents] = useState([
    { id: 'ev_1', type: 'reward_granted', user: 'cadet_orion', amount: 200, time: '2 mins ago' },
    { id: 'ev_2', type: 'ad_completed', user: 'pilot_ace', placement: 'DOUBLE_CREDITS', time: '5 mins ago' },
    { id: 'ev_3', type: 'reward_rejected', user: 'suspicious_client', reason: 'Unverified opportunity token', time: '12 mins ago' },
    { id: 'ev_4', type: 'ship_upgraded', user: 'star_cmdr', cost: 450, time: '18 mins ago' },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950 text-rose-300 text-xs font-mono uppercase tracking-widest mb-2 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Administrative Command</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            ECONOMY & AD REWARD AUDIT
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Real-time analytics verifying currency circulation, ad conversion funnels, and fraud detection.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Live Metrics Stream</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="sci-fi-panel p-5 rounded-xl border border-cyan-500/30">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">Ad Opportunities</span>
          <div className="text-2xl font-bold font-mono text-cyan-300">{metrics.totalAdOpportunities}</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">90.1% Completion Rate</span>
        </div>

        <div className="sci-fi-panel p-5 rounded-xl border border-amber-500/30">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">Credits Injected</span>
          <div className="text-2xl font-bold font-mono text-amber-300">+{metrics.creditsGranted.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Via verified rewards</span>
        </div>

        <div className="sci-fi-panel p-5 rounded-xl border border-purple-500/30">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">Credits Sunk</span>
          <div className="text-2xl font-bold font-mono text-purple-300">-{metrics.creditsSpent.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">In upgrades & armory</span>
        </div>

        <div className="sci-fi-panel p-5 rounded-xl border border-rose-500/30">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">Fraud / Rejected</span>
          <div className="text-2xl font-bold font-mono text-rose-400">{metrics.rewardRejectionCount}</div>
          <span className="text-[11px] text-rose-300 mt-1 block">Idempotency protected</span>
        </div>
      </div>

      {/* Conversion Funnels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="sci-fi-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-heading font-bold text-base text-white pb-3 border-b border-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> Rewarded Ad Placement Conversion
          </h3>
          
          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Double Credits On Victory:</span>
                <span className="text-amber-400 font-bold">{metrics.doubleCreditsConversion}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full" style={{ width: `${metrics.doubleCreditsConversion}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Defeat Checkpoint Revive:</span>
                <span className="text-rose-400 font-bold">{metrics.reviveConversion}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-400 h-full" style={{ width: `${metrics.reviveConversion}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Security Audit Feed */}
        <div className="sci-fi-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-heading font-bold text-base text-white pb-3 border-b border-slate-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" /> Recent Security & Analytics Audit Stream
          </h3>

          <div className="space-y-2 text-xs font-mono">
            {recentEvents.map((ev) => (
              <div key={ev.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ev.type.includes('granted') ? 'bg-emerald-950 text-emerald-300' :
                    ev.type.includes('rejected') ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-cyan-300'
                  }`}>
                    {ev.type}
                  </span>
                  <span className="text-slate-300">{ev.user}</span>
                </div>
                <span className="text-slate-500 text-[11px]">{ev.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
