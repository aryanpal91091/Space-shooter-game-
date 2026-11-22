import React, { useState } from 'react';
import { POWERUPS_DATA } from '../data/powerupsData';
import { useGame } from '../context/GameContext';
import {
  Zap,
  Shield,
  Coins,
  CheckCircle2,
  AlertCircle,
  Plus,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function PowerUpInventoryPage() {
  const { wallet, inventory, acquirePowerup } = useGame();
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleBuy = async (p) => {
    setSuccessMsg(null);
    setErrorMsg(null);

    if (wallet.credits < p.costCredits) {
      setErrorMsg(`Insufficient Credits! Need ${p.costCredits} CR.`);
      return;
    }

    try {
      await acquirePowerup(p.id, p.costCredits);
      setSuccessMsg(`Acquired 1x ${p.name}!`);
    } catch (err) {
      setErrorMsg(err.message || 'Purchase failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-2 border border-cyan-500/30">
            <Zap className="w-3.5 h-3.5" />
            <span>Tactical Combat Armory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            POWER-UP INVENTORY
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Acquire combat modules for deployment during space battles. Triggerable via Keys [1] through [8] or HUD buttons.
          </p>
        </div>

        {/* Available Credits */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-amber-300 font-bold">
          <img src="/assets/pickups/credit_cache.svg" alt="CR" className="w-4 h-4" />
          <span>{wallet.credits.toLocaleString()} Credits Available</span>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 8 Power-ups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {POWERUPS_DATA.map((p, idx) => {
          const ownedQty = inventory[p.id] || 0;

          return (
            <div
              key={p.id}
              className="sci-fi-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header & Owned Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                    KEY [{idx + 1}]
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-300 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800">
                    Stock: <strong className="text-white">{ownedQty}</strong>
                  </span>
                </div>

                {/* Icon & Title */}
                <div className="text-center py-2 mb-3">
                  <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-xl" />
                    <img src={p.icon} alt={p.name} className="w-16 h-16 object-contain relative z-10" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-white">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 min-h-[40px]">
                    {p.description}
                  </p>
                </div>

                {/* Specs */}
                <div className="space-y-1.5 text-xs font-mono bg-slate-900/90 p-3 rounded-xl border border-slate-800 mb-4">
                  <div className="flex justify-between text-slate-400">
                    <span>Duration:</span>
                    <span className="text-cyan-300 font-bold">{p.duration > 0 ? `${p.duration}s` : 'Instant'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Recharge Cooldown:</span>
                    <span className="text-purple-300 font-bold">{p.cooldown}s</span>
                  </div>
                </div>
              </div>

              {/* Purchase Button */}
              <div>
                <button
                  onClick={() => handleBuy(p)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-cyan-950/80 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 hover:text-white font-heading font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Acquire (+1) for {p.costCredits} CR</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
