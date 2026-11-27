import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  Rocket,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Recovery Mode Tab State
  const [mode, setMode] = useState('login'); // 'login' | 'recovery'
  const [recoveryStep, setRecoveryStep] = useState(1); // 1 = request code, 2 = enter code & reset
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { login, loginAsGuest, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Restore remembered email on mount
  useEffect(() => {
    const remembered = localStorage.getItem('odyssey_remember_email');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLaunch = () => {
    setError(null);
    loginAsGuest();
    navigate(from, { replace: true });
  };

  const handleRequestRecovery = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your pilot communications email.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setSuccessMsg(res.message || 'Emergency recovery transmission dispatched.');
      if (res.recoveryCode) {
        setRecoveryCode(res.recoveryCode);
      }
      setRecoveryStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to transmit recovery code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('New clearance code must be at least 6 characters.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await resetPassword(email, recoveryCode, newPassword);
      setSuccessMsg(res.message || 'Clearance code successfully updated! You may now sign in.');
      setPassword(newPassword);
      setMode('login');
      setRecoveryStep(1);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update clearance code.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('pilot@veloop.io');
    setPassword('Odyssey2026!');
    setError(null);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 overflow-hidden select-none">
      
      {/* Background Cosmic Starfield & Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center z-10">
        
        {/* Left Side: Spaceship Visual & Fleet Hologram (Hidden on small mobile) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col items-center text-center p-6 sci-fi-panel rounded-3xl border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl" />
          
          <div className="relative my-4">
            {/* Holographic Radar Ring */}
            <div className="w-48 h-48 rounded-full border border-cyan-500/30 border-dashed animate-spin-slow flex items-center justify-center">
              <div className="w-36 h-36 rounded-full border border-cyan-400/20" />
            </div>

            {/* Floating Spaceship Model */}
            <img
              src="/assets/ships/interceptor.svg"
              alt="Interceptor Flagship"
              className="absolute inset-0 m-auto w-32 h-32 object-contain drop-shadow-[0_0_25px_rgba(6,182,212,0.8)] animate-bounce-subtle"
            />
          </div>

          <div className="space-y-1.5 mt-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-300" /> FLAGSHIP STATUS: ONLINE
            </span>
            <h3 className="font-heading font-black text-xl text-white tracking-wider glow-cyan">
              {GAME_NAME}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Ascend to fleet command, pilot cutting-edge interceptors, and vanquish sector bosses across the galaxy.
            </p>
          </div>

          {/* Tactical Badges */}
          <div className="grid grid-cols-2 gap-2 w-full mt-6 text-[10px] font-mono">
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>5 Pilot Ships</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>50 Missions</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Terminal */}
        <div className="lg:col-span-7 sci-fi-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.25)] backdrop-blur-xl relative">
          
          {/* Header Mode Switcher */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                {mode === 'login' ? <Lock className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="font-heading font-black text-xl sm:text-2xl text-white">
                  {mode === 'login' ? 'PILOT IDENTIFICATION' : 'CLEARANCE RECOVERY'}
                </h2>
                <p className="text-[11px] text-slate-400 font-mono">
                  {mode === 'login' ? 'Connect to Starfleet Tactical Network' : 'Emergency Security Protocol'}
                </p>
              </div>
            </div>

            {/* Quick Toggle Mode */}
            {mode === 'recovery' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
              >
                Back to Login
              </button>
            )}
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-start gap-2.5 text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-start gap-2.5 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: Standard Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Pilot Communications Email</span>
                  <span className="text-[10px] text-slate-500 lowercase">e.g. commander@fleet.io</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="commander@spacefleet.io"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-slate-100 text-sm font-sans transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono uppercase text-slate-300">
                    Security Clearance Code (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('recovery'); setError(null); setSuccessMsg(null); }}
                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
                  >
                    Forgot Code?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-slate-100 text-sm font-sans transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <span>Remember identification token</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold font-heading text-sm shadow-[0_0_25px_rgba(6,182,212,0.45)] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Authenticating Clearance...</span>
                  </>
                ) : (
                  <>
                    <span>Engage Fleet Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: Forgot / Reset Password Flow */}
          {mode === 'recovery' && (
            <div className="space-y-4">
              {recoveryStep === 1 ? (
                <form onSubmit={handleRequestRecovery} className="space-y-4">
                  <p className="text-xs text-slate-300">
                    Input your enlisted communications email. Starfleet command will generate a one-time emergency clearance token.
                  </p>
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold font-heading text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Transmitting Code...' : 'Dispatch Emergency Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <p className="text-xs text-slate-300">
                    Enter the 6-digit emergency recovery code dispatched to your communications channel and establish a new clearance password.
                  </p>
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                      6-Digit Recovery Code
                    </label>
                    <input
                      type="text"
                      required
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      placeholder="e.g. 748192"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-slate-100 text-sm font-mono text-center tracking-widest text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                      New Clearance Password (Min 6 Characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-slate-100 text-sm font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold font-heading text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Updating Password...' : 'Save New Clearance Code'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick Access Actions: Play as Guest & Demo Fast Fill */}
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
            
            {/* Play as Guest Option */}
            <button
              type="button"
              onClick={handleGuestLaunch}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-indigo-500/20 hover:from-emerald-500/30 hover:to-indigo-500/30 border border-emerald-400/50 text-xs font-heading font-extrabold text-emerald-300 flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Launch As Guest Pilot (Instant Play — No Account Required)</span>
            </button>

            {/* Auto-fill demo account */}
            <button
              type="button"
              onClick={fillDemoAccount}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-cyan-400 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Auto-fill Verified Pilot Credentials (pilot@veloop.io)</span>
            </button>

            {/* Enlist Link */}
            <div className="text-center text-xs text-slate-400 pt-1">
              Unregistered recruit?{' '}
              <Link to="/register" className="text-cyan-400 hover:underline font-semibold font-mono">
                Enlist New Pilot Record ➔
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
