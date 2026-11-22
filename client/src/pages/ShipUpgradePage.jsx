import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SHIPS_DATA } from '../data/shipsData';
import { useGame } from '../context/GameContext';
import {
  Rocket,
  ArrowLeft,
  Shield,
  Zap,
  Crosshair,
  Flame,
  CheckCircle2,
  AlertCircle,
  Coins,
  ArrowUpCircle,
} from 'lucide-react';

export default function ShipUpgradePage() {
  const { shipId } = useParams();
  const { wallet, shipUpgrades, upgradeShipAttribute } = useGame();

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const ship = SHIPS_DATA.find((s) => s.id === shipId) || SHIPS_DATA[0];
  const upgrades = shipUpgrades[ship.id] || {
    weaponDamage: 1,
    fireRate: 1,
    maxHealth: 1,
    moveSpeed: 1,
    shieldCapacity: 1,
    specialCooldown: 1,
  };

  const attributeLabels = {
    weaponDamage: { name: 'Weapon Particle Yield (Damage)', unit: 'DMG', icon: Crosshair },
    fireRate: { name: 'Plasma Discharge Velocity (Fire Rate)', unit: 'sec', icon: Zap },
    maxHealth: { name: 'Dura-Steel Hull Plating (Health)', unit: 'HP', icon: Flame },
    moveSpeed: { name: 'Impulse Thruster Array (Speed)', unit: 'px/s', icon: Rocket },
    shieldCapacity: { name: 'Deflector Matrix Core (Shield)', unit: 'SHD', icon: Shield },
    specialCooldown: { name: 'Auxiliary Capacitor (Cooldown)', unit: 'sec', icon: ArrowUpCircle },
  };

  const handleUpgrade = async (attrKey) => {
    setMessage(null);
    setError(null);

    const currentLevel = upgrades[attrKey] || 1;
    const upgradeSpec = ship.upgrades[attrKey];

    if (currentLevel >= upgradeSpec.maxLevel) {
      setError('System already at maximum performance ceiling (Level 5).');
      return;
    }

    const cost = currentLevel * upgradeSpec.costMultiplier;
    if (wallet.credits < cost) {
      setError(`Insufficient Credits. Required: ${cost} CR.`);
      return;
    }

    try {
      await upgradeShipAttribute(ship.id, attrKey, cost);
      setMessage(`Successfully calibrated ${attributeLabels[attrKey]?.name || attrKey} to Level ${currentLevel + 1}!`);
    } catch (err) {
      setError(err.message || 'Upgrade operation failed.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <Link
            to="/hangar"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return To Fleet Hangar
          </Link>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">
            {ship.name} — REFIT LAB
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Enhance weapon damage, hull plating, shield capacity, and cooldowns.
          </p>
        </div>

        {/* Available Credits */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-amber-300 font-bold">
          <img src="/assets/pickups/credit_cache.svg" alt="CR" className="w-4 h-4" />
          <span>{wallet.credits.toLocaleString()} Credits Available</span>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Ship Overview Card */}
      <div className="sci-fi-panel p-6 rounded-2xl border border-cyan-500/30 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-32 h-32 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl" />
          <img src={ship.image} alt={ship.name} className="w-24 h-24 object-contain relative z-10" />
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
            {ship.class} Class Vessel
          </span>
          <h3 className="text-xl font-bold font-heading text-white">{ship.name}</h3>
          <p className="text-xs text-slate-300 max-w-xl">{ship.description}</p>
        </div>
      </div>

      {/* Upgrades List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(ship.upgrades).map(([attrKey, spec]) => {
          const currentLevel = upgrades[attrKey] || 1;
          const isMax = currentLevel >= spec.maxLevel;
          const cost = currentLevel * spec.costMultiplier;
          const labelInfo = attributeLabels[attrKey] || { name: attrKey, unit: '', icon: Zap };
          const Icon = labelInfo.icon;

          return (
            <div
              key={attrKey}
              className="sci-fi-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-cyan-500/30 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span className="font-heading font-bold text-sm text-slate-100">
                      {labelInfo.name}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-cyan-300">
                    LVL {currentLevel} / {spec.maxLevel}
                  </span>
                </div>

                {/* Level Pips */}
                <div className="flex items-center gap-1.5 my-3">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        lvl <= currentLevel
                          ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                          : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex justify-between text-xs font-mono text-slate-400 mb-4">
                  <span>Effect per tier:</span>
                  <span className="text-emerald-400 font-bold">
                    {spec.statDelta > 0 ? `+${spec.statDelta}` : spec.statDelta} {labelInfo.unit}
                  </span>
                </div>
              </div>

              <div>
                {isMax ? (
                  <button
                    disabled
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 font-mono text-xs cursor-default flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Maximum Upgrade Reached
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(attrKey)}
                    className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold font-heading text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    Upgrade System ({cost} CR)
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
