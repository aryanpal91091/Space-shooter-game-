import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, ArrowRight, AlertCircle, Shield } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (username.length < 3) {
      setError('Pilot Call-sign must be at least 3 characters long.');
      return;
    }
    if (password.length < 6) {
      setError('Clearance Code must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Try a different email or call-sign.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md sci-fi-panel p-8 rounded-2xl border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.2)]">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-white">
            ENLIST PILOT
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Register your command profile for {GAME_NAME}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
              Pilot Call-Sign (Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="StarCommander99"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-slate-100 text-sm font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
              Secure Communications Email
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

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
              Clearance Code (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:outline-none text-slate-100 text-sm font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold font-heading text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? 'Creating Service Record...' : 'Complete Enlistment'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
          Already an enlisted pilot?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline font-semibold">
            Access Terminal
          </Link>
        </div>

      </div>
    </div>
  );
}
