import React from 'react';
import { Link } from 'react-router-dom';
import { SHIPS_DATA } from '../data/shipsData';
import { useGame } from '../context/GameContext';
import {
  Rocket,
  Shield,
  Zap,
  Check,
  Lock,
  ArrowRight,
  Sparkles,
  Flame,
  Crosshair,
} from 'lucide-react';

export default function HangarPage() {
  const {
    wallet,
    selectedShipId,
    selectShip,
    unlockedShips,
    unlockShip,
    shipUpgrades,
  } = useGame();

  const handleUnlock = async (ship) => {
    try {
      await unlockShip(ship.id, ship.unlockCost.credits, ship.unlockCost.energyCores);
    } catch (err) {
      alert(err.message || 'Cannot unlock ship');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hangar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-2 border border-cyan-500/30">
            <Rocket className="w-3.5 h-3.5" />
            <span>Star Fleet Drydock & Hangar</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            SPACESHIP FLEET HANGAR
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Inspect combat specifications, select your active flagship, or unlock advanced experimental vessels.
          </p>
        </div>

        {/* Currency summary */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <img src="/assets/pickups/credit_cache.svg" alt="CR" className="w-4 h-4" />
            <span>{wallet.credits.toLocaleString()} CR</span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-1.5 text-purple-300 font-bold">
            <img src="/assets/pickups/energy_core.svg" alt="Cores" className="w-4 h-4" />
            <span>{wallet.energyCores} Cores</span>
          </div>
        </div>
      </div>

      {/* 5 Ships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SHIPS_DATA.map((ship) => {
          const isOwned = unlockedShips.includes(ship.id);
          const isSelected = selectedShipId === ship.id;
          const upgrades = shipUpgrades[ship.id] || {};

          // Calculate upgraded stats
          const dmg = ship.stats.damage + ((upgrades.weaponDamage || 1) - 1) * ship.upgrades.weaponDamage.statDelta;
          const hp = ship.stats.health + ((upgrades.maxHealth || 1) - 1) * ship.upgrades.maxHealth.statDelta;
          const shd = ship.stats.shield + ((upgrades.shieldCapacity || 1) - 1) * ship.upgrades.shieldCapacity.statDelta;
          const spd = ship.stats.speed + ((upgrades.moveSpeed || 1) - 1) * ship.upgrades.moveSpeed.statDelta;

          return (
            <div
              key={ship.id}
              className={`sci-fi-panel p-6 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/15 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
                  : isOwned
                  ? 'border-slate-700 hover:border-cyan-500/50'
                  : 'border-slate-800 opacity-80'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-cyan-500 text-black text-[10px] font-mono font-extrabold tracking-wider uppercase flex items-center gap-1 shadow-md">
                  <Check className="w-3 h-3 stroke-[3]" /> Active Flagship
                </div>
              )}

              <div>
                {/* Ship Graphic Showcase */}
                <div className="relative py-8 text-center flex items-center justify-center">
                  <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                  <img
                    src={ship.image}
                    alt={ship.name}
                    className="w-32 h-32 object-contain relative z-10 hover:scale-105 transition-transform"
                  />
                </div>

                {/* Identity */}
                <div className="mb-4">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {ship.class} Class
                  </span>
                  <h3 className="font-heading font-extrabold text-xl text-white mt-1">
                    {ship.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {ship.description}
                  </p>
                </div>

                {/* Live Stats */}
                <div className="space-y-2 text-xs font-mono bg-slate-900/90 p-3 rounded-xl border border-slate-800 mb-4">
                  <div className="flex justify-between text-slate-400">
                    <span>Hull Armor:</span>
                    <span className="text-emerald-400 font-bold">{hp} HP</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Energy Shield:</span>
                    <span className="text-cyan-400 font-bold">{shd} SHD</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Weapon Firepower:</span>
                    <span className="text-amber-400 font-bold">{dmg} DMG</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Sub-light Velocity:</span>
                    <span className="text-sky-300 font-bold">{spd} px/s</span>
                  </div>
                  <div className="flex justify-between text-slate-400 border-t border-slate-800/80 pt-1.5">
                    <span>Special Ability:</span>
                    <span className="text-purple-300 font-bold">{ship.specialAbility.name}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                {isOwned ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => selectShip(ship.id)}
                      disabled={isSelected}
                      className={`py-2 px-3 rounded-xl text-xs font-heading font-bold transition-all ${
                        isSelected
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30 cursor-default'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {isSelected ? 'Equipped' : 'Deploy Ship'}
                    </button>
                    <Link
                      to={`/hangar/upgrade/${ship.id}`}
                      className="py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-heading font-extrabold flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Upgrades</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUnlock(ship)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold font-heading text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      Unlock ({ship.unlockCost.credits} CR
                      {ship.unlockCost.energyCores > 0 ? ` + ${ship.unlockCost.energyCores} Cores` : ''})
                    </span>
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
