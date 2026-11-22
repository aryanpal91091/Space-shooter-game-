import React from 'react';
import { Link } from 'react-router-dom';
import { GAME_NAME } from '../../config/gameConfig';
import { Shield, Sparkles, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#02050e] border-t border-slate-900 text-slate-400 py-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Info */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span className="font-heading font-bold text-slate-200 tracking-wider">
            {GAME_NAME}
          </span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span>VELoop Rewards Full-Stack Developer Internship Assignment</span>
        </div>

        {/* Center Engine / System Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Phaser 3.88 • Node Express API • Authoritative Economy</span>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-4 text-slate-400">
          <Link to="/help" className="hover:text-cyan-400 transition-colors">Controls & Guide</Link>
          <Link to="/settings" className="hover:text-cyan-400 transition-colors">Settings</Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <Terminal className="w-3.5 h-3.5" /> Source
          </a>
        </div>
      </div>
    </footer>
  );
}
