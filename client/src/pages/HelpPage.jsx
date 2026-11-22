import React from 'react';
import {
  HelpCircle,
  Keyboard,
  Smartphone,
  Shield,
  Crosshair,
  Zap,
  Star,
  Award,
} from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-2 border border-cyan-500/30">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Cadet Flight Manual</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          CONTROLS & TACTICAL PROTOCOLS
        </h1>
        <p className="text-slate-300 text-sm mt-1">
          Complete combat guidance for Windows 11 desktop, keyboard shortcuts, and touch controls.
        </p>
      </div>

      {/* Controls Comparison: Desktop vs Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Desktop Controls */}
        <div className="sci-fi-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <h3 className="font-heading font-bold text-lg text-white">
              Desktop & Keyboard Controls
            </h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">Ship Navigation</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-bold">
                [W, A, S, D] or [ARROWS]
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">Plasma Weapon Discharge</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-bold">
                Continuous Auto / [SPACE]
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">Tactical Power-Ups (1–8)</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-purple-300 font-bold">
                Keys [1] through [8]
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">Tactical Pause / Resume</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-amber-300 font-bold">
                [ESCAPE] Key
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="sci-fi-panel p-6 rounded-2xl border border-purple-500/30 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Smartphone className="w-5 h-5 text-purple-400" />
            <h3 className="font-heading font-bold text-lg text-white">
              Mobile & Tablet Touch Controls
            </h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">Vessel Maneuvering</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-purple-300 font-bold">
                Touch Drag on Screen
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">Weapons Firing</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-purple-300 font-bold">
                Automatic Fire Loop
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">Power-Up Activation</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-bold">
                Touch Icons on Bottom Bar
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">Pause Control</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-amber-300 font-bold">
                Top HUD Pause Button
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Combat Tactics Guide */}
      <div className="sci-fi-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-heading font-bold text-lg text-white pb-3 border-b border-slate-800">
          Advanced Combat Flight Doctrine
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-mono">
              <Shield className="w-4 h-4" /> Shield Management
            </div>
            <p className="text-slate-300 leading-relaxed">
              Shields absorb damage before hull plating takes harm. If your shield is depleted, collect Shield Orbs or activate Shield Pulse for temporary invulnerability.
            </p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono">
              <Crosshair className="w-4 h-4" /> High-Value Targets
            </div>
            <p className="text-slate-300 leading-relaxed">
              Elite Enemies and Long-Range Gunships pose significant threat. Eliminate them quickly to avoid screen-wide bullet spreads and gain guaranteed combat pickups.
            </p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-yellow-400 font-bold font-mono">
              <Star className="w-4 h-4" /> 3-Star Mastery
            </div>
            <p className="text-slate-300 leading-relaxed">
              To earn 3 stars on a mission, finish with over 50% hull integrity and meet the sector target score without using checkpoint revives.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
