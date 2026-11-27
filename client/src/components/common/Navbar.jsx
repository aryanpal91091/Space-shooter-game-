import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GAME_NAME } from '../../config/gameConfig';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import {
  Rocket,
  Compass,
  Zap,
  Wallet,
  Trophy,
  Calendar,
  Gift,
  Volume2,
  VolumeX,
  User,
  LogOut,
  Menu,
  X,
  HelpCircle,
  Settings as SettingsIcon,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { wallet, audioSettings, updateAudio } = useGame();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Rocket },
    { name: 'Campaign', path: '/campaign', icon: Compass },
    { name: 'Hangar', path: '/hangar', icon: Rocket },
    { name: 'Power-Ups', path: '/powerups', icon: Zap },
    { name: 'Daily', path: '/daily', icon: Calendar },
    { name: 'Rewards', path: '/rewards', icon: Gift },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  const isActive = (path) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-40 bg-[#030712]/90 backdrop-blur-md border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Game Title */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center p-1.5 group-hover:box-glow-cyan transition-all">
              <img src="/assets/favicon.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                {GAME_NAME}
              </span>
              <span className="block text-[10px] tracking-widest text-slate-400 uppercase font-mono -mt-1">
                VELoop Fleet Command
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                      active
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action Icons & User Balances */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Credits & Energy Cores Bar */}
                <div className="hidden sm:flex items-center gap-3 bg-slate-900/80 border border-slate-700/60 px-3 py-1 rounded-full text-xs">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold" title="Credits">
                    <img src="/assets/pickups/credit_cache.svg" alt="Credits" className="w-4 h-4" />
                    <span>{wallet.credits.toLocaleString()}</span>
                  </div>
                  <div className="w-px h-3.5 bg-slate-700" />
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold" title="Energy Cores">
                    <img src="/assets/pickups/energy_core.svg" alt="Cores" className="w-4 h-4" />
                    <span>{wallet.energyCores}</span>
                  </div>
                  <div className="w-px h-3.5 bg-slate-700" />
                  <div className="flex items-center gap-1 text-cyan-300 font-mono text-[11px]" title="Level">
                    <span>LVL {wallet.level}</span>
                  </div>
                </div>

                {/* Audio Toggle */}
                <button
                  onClick={() => updateAudio('muted')}
                  title={audioSettings.muted ? 'Unmute Audio' : 'Mute Audio'}
                  className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-800 transition-colors"
                >
                  {audioSettings.muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                </button>

                {/* Profile Link or Guest Save Progress Pill */}
                {user.isGuest ? (
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse"
                    title="Guest Mode: Save Progress to Permanent Profile"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Save Progress</span>
                  </Link>
                ) : (
                  <Link
                    to="/profile"
                    className="hidden sm:flex items-center gap-2 p-1.5 pr-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors"
                    title="Player Profile"
                  >
                    <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                      {user.username?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <span className="text-xs font-semibold max-w-[90px] truncate">{user.username}</span>
                  </Link>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-lg bg-slate-900/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-md text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-md text-sm font-semibold text-black bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all font-heading"
                >
                  Enlist
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {user && mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#030712] px-4 pt-3 pb-6 space-y-2">
          {/* Mobile Balances */}
          <div className="flex items-center justify-around bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 mb-3 text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <img src="/assets/pickups/credit_cache.svg" alt="Credits" className="w-4 h-4" />
              <span>{wallet.credits.toLocaleString()} CR</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-300 font-bold">
              <img src="/assets/pickups/energy_core.svg" alt="Cores" className="w-4 h-4" />
              <span>{wallet.energyCores} Cores</span>
            </div>
            <div className="text-cyan-400 font-mono font-bold">
              LVL {wallet.level}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-sm font-semibold ${
                    active
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs text-slate-400">
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1 hover:text-white">
              <User className="w-3.5 h-3.5" /> Profile
            </Link>
            <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1 hover:text-white">
              <SettingsIcon className="w-3.5 h-3.5" /> Settings
            </Link>
            <Link to="/help" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1 hover:text-white">
              <HelpCircle className="w-3.5 h-3.5" /> Help
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
