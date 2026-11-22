import React from 'react';
import { Link } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { useAuth } from '../context/AuthContext';
import {
  Rocket,
  Shield,
  Zap,
  Trophy,
  Play,
  ArrowRight,
  Crosshair,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { SHIPS_DATA } from '../data/shipsData';
import { SECTORS } from '../data/missionsData';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Background Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-fuchsia-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>VELoop Rewards Internship Benchmark</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
            DEFEND THE GALAXY IN <br />
            <span className="font-heading text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 glow-cyan">
              {GAME_NAME}
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 mb-10 leading-relaxed font-sans">
            A high-octane 2D arcade space shooter with genuine collision physics, 
            50 campaign missions across 5 sectors, 5 colossal bosses, deep ship upgrades, 
            and a strictly audited, sustainable rewarded-ad economy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/campaign' : '/register'}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold font-heading text-lg shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-black" />
              {user ? 'Enter Campaign' : 'Enlist As Pilot'}
            </Link>

            <Link
              to={user ? '/hangar' : '/login'}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-lg transition-all flex items-center justify-center gap-2"
            >
              {user ? 'Inspect Fleet Hangar' : 'Pilot Sign In'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Hero Ship Showcase Image */}
          <div className="mt-16 max-w-4xl mx-auto relative group">
            <div className="sci-fi-panel p-6 sm:p-10 rounded-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-left space-y-4">
                <div className="inline-block px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 text-xs font-mono font-bold uppercase">
                  Flagship Interceptor
                </div>
                <h3 className="text-2xl font-bold font-heading text-white">
                  Aero-V Interceptor Class
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Engineered with synchronized twin plasma bolters, high maneuverability thrusters, and emergency quantum warp evasion. Fully upgradable weapon damage and shield capacity.
                </p>
                <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs font-mono">
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">SPEED</span>
                    <span className="text-cyan-400 font-bold text-sm">340 px/s</span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">ARMOR</span>
                    <span className="text-emerald-400 font-bold text-sm">100 HP</span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">ABILITY</span>
                    <span className="text-purple-400 font-bold text-sm">Warp Jump</span>
                  </div>
                </div>
              </div>

              <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse" />
                <img
                  src="/assets/ships/interceptor.svg"
                  alt="Aero-V Interceptor"
                  className="w-40 h-40 object-contain relative z-10 animate-[bounce_4s_infinite]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 bg-slate-950/60 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold font-heading text-white">
              CORE COMBAT & ECONOMY ARCHITECTURE
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              Built to the highest technical standards of the VELoop Rewards specification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="sci-fi-panel p-8 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-6">
                <Crosshair className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-3">
                Playable Phaser 3 Engine
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Genuine 60 FPS 2D combat with frame-rate independent physics, real projectile collision detection, multi-phase boss encounters, and 5 enemy AI archetypes.
              </p>
            </div>

            <div className="sci-fi-panel p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-6">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-3">
                50 Data-Driven Missions
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Progress through 5 unique sectors from Orion Frontier to the Void Citadel with distinct objectives: enemy purges, time survival, and boss duels.
              </p>
            </div>

            <div className="sci-fi-panel p-8 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-6">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-3">
                Authoritative Reward Economy
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Zero client-side trust. Cryptographic session verification, double-spend prevention, revive limits, and an audited transactional ledger.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Showcase */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12">
            <div>
              <span className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-widest">FLEET PROTOCOLS</span>
              <h2 className="text-3xl font-extrabold font-heading text-white mt-1">
                5 DISTINCT COMBAT CRAFT
              </h2>
            </div>
            <Link to="/hangar" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-4 md:mt-0">
              View Fleet Specifications <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {SHIPS_DATA.map((ship) => (
              <div
                key={ship.id}
                className="sci-fi-panel p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
              >
                <div className="text-center py-4">
                  <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <img src={ship.image} alt={ship.name} className="w-20 h-20 object-contain hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {ship.class}
                  </span>
                  <h4 className="font-heading font-bold text-base text-white mt-2">{ship.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ship.description}</p>
                </div>

                <div className="border-t border-slate-800/80 pt-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>HP:</span>
                    <span className="text-emerald-400">{ship.stats.health}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>SPD:</span>
                    <span className="text-cyan-400">{ship.stats.speed}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ABILITY:</span>
                    <span className="text-purple-300 truncate max-w-[90px]">{ship.specialAbility.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Boss Encounters Preview */}
      <section className="py-20 bg-slate-950/70 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase text-rose-400 font-bold tracking-widest">ARMADA TITANS</span>
            <h2 className="text-3xl font-extrabold font-heading text-white mt-1">
              5 ORIGINAL BOSS ENCOUNTERS
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Every 10th mission culminates in an epic showdown featuring telegraphed patterns, enraged phases, and exclusive Energy Core drops.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {SECTORS.map((sec, idx) => (
              <div
                key={sec.id}
                className="sci-fi-panel p-5 rounded-xl border border-rose-950/50 hover:border-rose-500/40 transition-all text-center"
              >
                <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center">
                  <img
                    src={`/assets/bosses/boss_${['warden', 'serpent', 'solar', 'carrier', 'emperor'][idx]}.svg`}
                    alt={sec.bossName}
                    className="w-22 h-22 object-contain hover:scale-105 transition-transform"
                  />
                </div>
                <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">
                  Sector {idx + 1} Climax
                </span>
                <h4 className="font-heading font-bold text-sm text-slate-100 mt-1">
                  {sec.bossName}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {sec.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 relative text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white mb-4">
            READY TO JOIN THE FLEET?
          </h2>
          <p className="text-slate-300 text-base mb-8">
            Create your pilot profile today and battle across 50 sectors to claim the high score on the global leaderboard.
          </p>
          <Link
            to={user ? '/campaign' : '/register'}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold font-heading text-lg shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all"
          >
            <Rocket className="w-5 h-5" />
            {user ? 'Launch Campaign' : 'Create Free Pilot Profile'}
          </Link>
        </div>
      </section>
    </div>
  );
}
