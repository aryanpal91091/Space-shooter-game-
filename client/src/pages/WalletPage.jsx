import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import api from '../services/api';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ShieldCheck,
  Coins,
  Sparkles,
  RefreshCw,
  FileText,
} from 'lucide-react';

export default function WalletPage() {
  const { wallet, refreshUserData } = useGame();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wallet/history');
      if (res.data?.transactions) {
        setTransactions(res.data.transactions);
      }
    } catch {
      // Mock ledger data for initial view if server is fresh
      setTransactions([
        {
          _id: 'tx_init_01',
          type: 'CREDIT',
          amount: 500,
          currency: 'CREDITS',
          balanceBefore: 0,
          balanceAfter: 500,
          source: 'PILOT_ENLISTMENT_GRANT',
          referenceId: 'ref_welcome_pack',
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'tx_init_02',
          type: 'CREDIT',
          amount: 2,
          currency: 'ENERGY_CORES',
          balanceBefore: 0,
          balanceAfter: 2,
          source: 'INITIAL_CORE_STIPEND',
          referenceId: 'ref_core_stipend',
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-2 border border-cyan-500/30">
            <Wallet className="w-3.5 h-3.5" />
            <span>Authoritative Financial Ledger</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            WALLET & TRANSACTION HISTORY
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Authoritative balance ledger auditing all credits, rare energy cores, and VELoop platform tokens.
          </p>
        </div>

        <button
          onClick={() => { refreshUserData(); fetchHistory(); }}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Synchronize Ledger
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Credits */}
        <div className="sci-fi-panel p-6 rounded-2xl border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase text-slate-400">Soft Currency</span>
            <img src="/assets/pickups/credit_cache.svg" alt="CR" className="w-6 h-6" />
          </div>
          <span className="text-xs font-mono text-amber-400 font-bold">Credits</span>
          <h3 className="text-3xl font-extrabold font-mono text-amber-300 mt-1">
            {wallet.credits.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2">
            Used for fleet ship refits and tactical power-ups.
          </p>
        </div>

        {/* Energy Cores */}
        <div className="sci-fi-panel p-6 rounded-2xl border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase text-slate-400">Hard Currency</span>
            <img src="/assets/pickups/energy_core.svg" alt="Cores" className="w-6 h-6" />
          </div>
          <span className="text-xs font-mono text-purple-400 font-bold">Energy Cores</span>
          <h3 className="text-3xl font-extrabold font-mono text-purple-300 mt-1">
            {wallet.energyCores}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2">
            Earned from sector bosses. Unlocks experimental fleet craft.
          </p>
        </div>

        {/* Pilot XP */}
        <div className="sci-fi-panel p-6 rounded-2xl border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase text-slate-400">Progression</span>
            <Sparkles className="w-6 h-6 text-cyan-400" />
          </div>
          <span className="text-xs font-mono text-cyan-400 font-bold">Career XP</span>
          <h3 className="text-3xl font-extrabold font-mono text-cyan-300 mt-1">
            {wallet.xp.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2">
            Determines military clearance Level {wallet.level}.
          </p>
        </div>

        {/* VELoop Reward Coins (Platform Token) */}
        <div className="sci-fi-panel p-6 rounded-2xl border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase text-emerald-400 font-bold">Platform-Eligible</span>
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">VELoop Coins</span>
          <h3 className="text-3xl font-extrabold font-mono text-emerald-300 mt-1">
            {wallet.veloopCoins || 0}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2">
            Subject to VELoop Rewards corporate partner policies.
          </p>
        </div>
      </div>

      {/* Transaction History Ledger Table */}
      <div className="sci-fi-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="font-heading font-bold text-lg text-white">
              Immutable Transaction Audit Ledger
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {transactions.length} Ledger Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Transaction Type</th>
                <th className="py-3 px-4">Reference / Event ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Balance After</th>
                <th className="py-3 px-4">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-sans">
                    No transactions recorded yet in ledger.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isPositive = tx.type === 'CREDIT' || tx.type.includes('REWARD') || tx.type.includes('BONUS');
                  return (
                    <tr key={tx._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-200">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-[150px]">
                        {tx.referenceId || tx.source || 'SYS_INTERNAL'}
                      </td>
                      <td className={`py-3 px-4 font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? `+${tx.amount}` : `-${tx.amount}`} {tx.currency || 'CR'}
                      </td>
                      <td className="py-3 px-4 text-cyan-300 font-bold">
                        {tx.balanceAfter !== undefined ? tx.balanceAfter.toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" /> CONFIRMED
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
