import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import {
  User,
  Shield,
  Star,
  Rocket,
  Award,
  CheckCircle2,
  Mail,
  Edit2,
  Sparkles,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { wallet, unlockedShips, completedMissions } = useGame();

  const [username, setUsername] = useState(user?.username || 'StarCommander');
  const [isEditing, setIsEditing] = useState(false);
  const [savedMsg, setSavedMsg] = useState(null);

  const totalStars = Object.values(completedMissions).reduce((acc, curr) => acc + (curr.stars || 0), 0);
  const completedCount = Object.keys(completedMissions).length;

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ username });
    setIsEditing(false);
    setSavedMsg('Call-sign updated successfully.');
    setTimeout(() => setSavedMsg(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          PILOT SERVICE RECORD
        </h1>
        <p className="text-slate-300 text-sm mt-1">
          Authorized personnel file and telemetry combat record.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="sci-fi-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/30 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-4xl font-extrabold font-heading text-white shadow-[0_0_25px_rgba(6,182,212,0.4)]">
          {user?.username?.charAt(0).toUpperCase() || 'P'}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-2xl font-bold font-heading text-white">
              {user?.username || 'Pilot Officer'}
            </h2>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold w-fit mx-auto sm:mx-0">
              Clearance Level {wallet.level}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 flex items-center justify-center sm:justify-start gap-1">
            <Mail className="w-3.5 h-3.5" /> {user?.email || 'officer@veloop.io'}
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          {isEditing ? 'Cancel Edit' : 'Edit Call-sign'}
        </button>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="sci-fi-panel p-6 rounded-2xl border border-cyan-500/40 space-y-4">
          <h3 className="font-heading font-bold text-base text-white">
            Modify Pilot Call-sign
          </h3>
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              New Official Call-sign
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-slate-100 text-sm font-sans"
            />
          </div>
          <button
            type="submit"
            className="py-2 px-5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-heading font-bold text-xs"
          >
            Save Record Changes
          </button>
        </form>
      )}

      {/* Combat Service Career Record */}
      <div className="sci-fi-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-heading font-bold text-lg text-white pb-3 border-b border-slate-800">
          Career Deployment Record
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono text-xs">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">Missions Cleared</span>
            <span className="text-xl font-bold text-emerald-400">{completedCount} / 50</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">Stars Secured</span>
            <span className="text-xl font-bold text-yellow-400">{totalStars} ★</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">Fleet Commissioned</span>
            <span className="text-xl font-bold text-cyan-400">{unlockedShips.length} of 5 Ships</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">Career XP</span>
            <span className="text-xl font-bold text-purple-400">{wallet.xp} XP</span>
          </div>
        </div>
      </div>

    </div>
  );
}
