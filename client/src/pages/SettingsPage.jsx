import React from 'react';
import { useGame } from '../context/GameContext';
import {
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Music,
  Sliders,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

export default function SettingsPage() {
  const { audioSettings, updateAudio } = useGame();

  const handleReset = () => {
    updateAudio('sfx', 0.7);
    updateAudio('music', 0.5);
    if (audioSettings.muted) updateAudio('muted');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-2 border border-cyan-500/30">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Fleet Configuration</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          SYSTEM SETTINGS
        </h1>
        <p className="text-slate-300 text-sm mt-1">
          Adjust Web Audio synthesizers, combat feedback channels, and display parameters.
        </p>
      </div>

      {/* Audio Panel */}
      <div className="sci-fi-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/30 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="font-heading font-bold text-lg text-white">
              Acoustic Synthesizer Channels
            </h3>
          </div>

          <button
            onClick={() => updateAudio('muted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              audioSettings.muted
                ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                : 'bg-slate-900 text-cyan-300 border border-slate-700'
            }`}
          >
            {audioSettings.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{audioSettings.muted ? 'Muted' : 'Audio Active'}</span>
          </button>
        </div>

        {/* Sound Effects Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-cyan-400" /> Combat Sound Effects (SFX)
            </span>
            <span className="text-cyan-400 font-bold">{Math.round(audioSettings.sfx * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={audioSettings.sfx}
            onChange={(e) => updateAudio('sfx', parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-900 rounded-lg appearance-none border border-slate-800"
          />
          <p className="text-[11px] text-slate-400">
            Controls laser discharges, missile launches, alien explosions, and shield alerts.
          </p>
        </div>

        {/* Background Music Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Music className="w-4 h-4 text-purple-400" /> Ambient Deep-Space Synth Soundtrack
            </span>
            <span className="text-purple-400 font-bold">{Math.round(audioSettings.music * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={audioSettings.music}
            onChange={(e) => updateAudio('music', parseFloat(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer h-2 bg-slate-900 rounded-lg appearance-none border border-slate-800"
          />
          <p className="text-[11px] text-slate-400">
            Procedural multi-oscillator cosmic drone generated via the HTML5 Web Audio API.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restore Default Audio
          </button>
        </div>
      </div>

    </div>
  );
}
