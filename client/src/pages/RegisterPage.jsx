import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Rocket,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, user } = useAuth();
  const { wallet, unlockedMissions, unlockedShips, shipUpgrades } = useGame();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Unset', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, label: 'Standard', color: 'bg-rose-500' };
    if (score <= 4) return { score: 2, label: 'Combat Grade', color: 'bg-amber-400' };
    return { score: 3, label: 'Command Clearance (Tactical)', color: 'bg-emerald-400' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (username.trim().length < 3) {
      setError('Pilot call-sign must be at least 3 characters long.');
      return;
    }
    if (password.length < 6) {
      setError('Clearance password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Confirmation password does not match.');
      return;
    }

    setLoading(true);

    // Prepare guest migration package if the user played as guest
    const guestData = user?.isGuest
      ? {
          guestWallet: wallet,
          guestProgress: { unlockedMissions },
          guestFleet: { unlockedShips, upgrades: shipUpgrades },
        }
      : null;

    try {
      await register(username.trim(), email.trim(), password, guestData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Try a different email or call-sign.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 overflow-hidden select-none">
      
      {/* Background Cosmic Starfield & Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-lg sci-fi-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.25)] backdrop-blur-xl z-10">
        
        {/* Terminal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.35)]">
            <UserPlus className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
            STARFLEET COMMAND ENLISTMENT
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide mt-1">
            CREATE FLEET PROFILE
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Establish your permanent pilot identity and record credentials for {GAME_NAME}
          </p>
        </div>

        {/* Guest Progress Migration Alert (If user is currently in guest mode) */}
        {user?.isGuest && (
          <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 to-yellow-950/80 border border-amber-500/50 flex items-start gap-3 text-amber-200 text-xs shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-heading font-bold text-amber-300 block">
                GUEST PROGRESS DETECTED & PRESERVED
              </span>
              <p className="text-[11px] text-amber-300/80">
                Your accumulated <strong className="text-amber-200">{wallet?.credits || 500} Credits</strong>,{' '}
                <strong className="text-amber-200">{unlockedShips?.length || 1} Ships</strong>, and unlocked missions will automatically transfer into your new permanent pilot record!
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-start gap-2.5 text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username / Call-sign */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Pilot Call-Sign (Username)</span>
              <span className="text-[10px] text-slate-500">Min 3 characters</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ValkyrieCommander"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-slate-100 text-sm font-sans"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
              Pilot Communications Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commander@spacefleet.io"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-slate-100 text-sm font-sans"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Security Clearance Code (Password)</span>
              {password && (
                <span className="text-[10px] font-mono text-cyan-400">
                  {strength.label}
                </span>
              )}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-slate-100 text-sm font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Visual Password Strength Bar */}
            {password && (
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${(strength.score / 3) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
              Confirm Security Clearance Code
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-slate-100 text-sm font-sans"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold font-heading text-sm shadow-[0_0_25px_rgba(6,182,212,0.45)] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Creating Service Record...</span>
              </>
            ) : (
              <>
                <span>Complete Enlistment & Enter Fleet</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Existing Member Link */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
          Already an enlisted pilot?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline font-semibold font-mono">
            Access Identification Terminal ➔
          </Link>
        </div>

      </div>

    </div>
  );
}
