import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PhaserGame from '../game/PhaserGame';
import { ALL_MISSIONS } from '../data/missionsData';
import { SHIPS_DATA } from '../data/shipsData';
import { POWERUPS_DATA } from '../data/powerupsData';
import { useGame } from '../context/GameContext';
import api from '../services/api';
import SimulatedAdModal from '../components/common/SimulatedAdModal';
import {
  Shield,
  Heart,
  Star,
  Pause,
  Play,
  RotateCcw,
  Home,
  Crosshair,
  Skull,
  Coins,
  Trophy,
  Zap,
  Gift,
  AlertTriangle,
  ArrowRight,
  Flame,
  Camera,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GameScreenPage() {
  const { missionId } = useParams();
  const navigate = useNavigate();

  const {
    wallet,
    setWallet,
    selectedShipId,
    shipUpgrades,
    unlockedMissions,
    setUnlockedMissions,
    completedMissions,
    setCompletedMissions,
    inventory,
  } = useGame();

  const mission = ALL_MISSIONS.find((m) => m.id === missionId) || ALL_MISSIONS[0];
  const shipConfig = SHIPS_DATA.find((s) => s.id === selectedShipId) || SHIPS_DATA[0];
  const currentUpgrades = shipUpgrades[selectedShipId] || {};

  // Session & Gameplay State
  const [sessionId, setSessionId] = useState(null);
  const [stats, setStats] = useState({
    health: 100,
    maxHealth: 100,
    shield: 50,
    maxShield: 50,
    score: 0,
    credits: 0,
    energyCores: 0,
    enemiesDefeated: 0,
  });

  const [waveInfo, setWaveInfo] = useState({ current: 1, total: 3 });
  const [bossState, setBossState] = useState(null); // { active: bool, name: '', current: 0, max: 0, percent: 1 }
  const [isPaused, setIsPaused] = useState(false);
  const [missionResult, setMissionResult] = useState(null); // null or results object

  // Rewarded Ad Modal state
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adPlacement, setAdPlacement] = useState('REVIVE'); // REVIVE, DOUBLE_CREDITS, DOUBLE_SCORE
  const [reviveUsed, setReviveUsed] = useState(false);
  const [doubleCreditsClaimed, setDoubleCreditsClaimed] = useState(false);
  const [doubleScoreClaimed, setDoubleScoreClaimed] = useState(false);
  const [screenshotSuccess, setScreenshotSuccess] = useState(false);

  const gameInstanceRef = useRef(null);

  // Take high-resolution gameplay screenshot directly from Phaser
  const handleTakeScreenshot = () => {
    try {
      if (gameInstanceRef.current?.renderer) {
        gameInstanceRef.current.renderer.snapshot((image) => {
          const link = document.createElement('a');
          link.download = `space_shooter_odyssey_${mission.id}_${Date.now()}.png`;
          link.href = image.src;
          link.click();
          setScreenshotSuccess(true);
          setTimeout(() => setScreenshotSuccess(false), 2000);
        });
      } else {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const link = document.createElement('a');
          link.download = `space_shooter_odyssey_${mission.id}_${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          setScreenshotSuccess(true);
          setTimeout(() => setScreenshotSuccess(false), 2000);
        }
      }
    } catch (err) {
      console.warn('Screenshot capture fallback:', err.message);
    }
  };

  // Initialize Game Session with Backend
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await api.post('/games/start', {
          missionId: mission.id,
          shipId: shipConfig.id,
        });
        if (res.data?.sessionId) {
          setSessionId(res.data.sessionId);
        }
      } catch (err) {
        // Fallback local session ID for local testing
        setSessionId(`sess_${Date.now()}`);
      }
    };
    initSession();
  }, [mission.id, shipConfig.id]);

  // Handle Mission Completion from Phaser
  const handleMissionEnd = async (results) => {
    setMissionResult(results);

    if (results.status === 'VICTORY') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (_) {}

      // Calculate next mission unlock
      const nextSequence = mission.sequence + 1;
      const nextMissionId = `m-${nextSequence}`;
      if (nextSequence <= 50 && !unlockedMissions.includes(nextMissionId)) {
        setUnlockedMissions((prev) => [...prev, nextMissionId]);
      }

      // Update completed missions
      setCompletedMissions((prev) => ({
        ...prev,
        [mission.id]: {
          stars: Math.max(prev[mission.id]?.stars || 0, results.stars),
          bestScore: Math.max(prev[mission.id]?.bestScore || 0, results.score),
        },
      }));

      // Submit authoritative results to server
      try {
        const payload = {
          score: results.score,
          duration: results.duration,
          enemiesDefeated: results.enemiesDefeated,
          bossDefeated: results.bossDefeated,
          accuracy: results.accuracy,
          damageTaken: results.damageTaken,
          stars: results.stars,
          status: 'VICTORY',
        };
        const submitRes = await api.post(`/games/${sessionId}/complete`, payload);
        if (submitRes.data?.wallet) {
          setWallet(submitRes.data.wallet);
        }
      } catch {
        // Fallback local balance update
        setWallet((prev) => ({
          ...prev,
          credits: prev.credits + results.creditsEarned,
          xp: prev.xp + results.xpEarned,
          energyCores: prev.energyCores + results.energyCoresEarned,
        }));
      }
    }
  };

  // Keyboard shortcut listener for power-ups (Keys 1 to 8) and Escape (Pause)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (missionResult) return;

      if (e.key === 'Escape') {
        togglePause();
        return;
      }

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 8) {
        const powerup = POWERUPS_DATA[num - 1];
        if (powerup) {
          triggerPowerup(powerup.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [missionResult, isPaused]);

  // Trigger Power-up in Phaser
  const triggerPowerup = (powerupId) => {
    const spaceScene = gameInstanceRef.current?.scene?.getScene('SpaceScene');
    if (spaceScene && !spaceScene.isGameOver) {
      spaceScene.triggerPowerup(powerupId);
    }
  };

  // Pause / Resume toggle
  const togglePause = () => {
    const spaceScene = gameInstanceRef.current?.scene?.getScene('SpaceScene');
    if (spaceScene && !spaceScene.isGameOver) {
      if (isPaused) {
        spaceScene.isPaused = false;
        setIsPaused(false);
      } else {
        spaceScene.isPaused = true;
        setIsPaused(true);
      }
    }
  };

  // Restart Mission
  const handleRestart = () => {
    window.location.reload();
  };

  // Rewarded Ad: Revive
  const openReviveAd = () => {
    setAdPlacement('REVIVE');
    setAdModalOpen(true);
  };

  // Rewarded Ad: Double Credits
  const openDoubleCreditsAd = () => {
    setAdPlacement('DOUBLE_CREDITS');
    setAdModalOpen(true);
  };

  // Rewarded Ad: Double Score
  const openDoubleScoreAd = () => {
    setAdPlacement('DOUBLE_SCORE');
    setAdModalOpen(true);
  };

  // Callback when Ad reward is validated
  const handleRewardGranted = async (claimData) => {
    if (adPlacement === 'REVIVE') {
      setReviveUsed(true);
      setMissionResult(null);
      const spaceScene = gameInstanceRef.current?.scene?.getScene('SpaceScene');
      if (spaceScene) {
        spaceScene.revivePlayer();
      }
    } else if (adPlacement === 'DOUBLE_CREDITS') {
      setDoubleCreditsClaimed(true);
      if (missionResult) {
        const extraCredits = missionResult.creditsEarned;
        setMissionResult((prev) => ({
          ...prev,
          creditsEarned: prev.creditsEarned * 2,
        }));
        setWallet((prev) => ({
          ...prev,
          credits: prev.credits + extraCredits,
        }));
      }
    } else if (adPlacement === 'DOUBLE_SCORE') {
      setDoubleScoreClaimed(true);
      if (missionResult) {
        setMissionResult((prev) => ({
          ...prev,
          score: prev.score * 2,
        }));
      }
    }
    setAdModalOpen(false);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      
      {/* Top Combat HUD */}
      <div className="w-full max-w-[480px] bg-slate-950/90 border border-cyan-500/30 rounded-t-xl px-4 py-2.5 flex items-center justify-between text-xs font-mono shadow-md backdrop-blur-md z-20">
        
        {/* Left: Health & Shield Gauges */}
        <div className="space-y-1.5 w-36">
          {/* Health Bar */}
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0 fill-rose-500" />
            <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-rose-500 h-full transition-all duration-200"
                style={{ width: `${Math.max(0, (stats.health / stats.maxHealth) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-rose-300 w-7 text-right font-bold">
              {Math.ceil(stats.health)}
            </span>
          </div>

          {/* Shield Bar */}
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0 fill-cyan-500" />
            <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-cyan-400 h-full transition-all duration-200"
                style={{ width: `${Math.max(0, (stats.shield / (stats.maxShield || 1)) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-cyan-300 w-7 text-right font-bold">
              {Math.ceil(stats.shield)}
            </span>
          </div>
        </div>

        {/* Center: Mission Score & Wave */}
        <div className="text-center">
          <div className="font-heading font-extrabold text-sm text-cyan-300 glow-cyan tracking-wider">
            {stats.score.toLocaleString()} PTS
          </div>
          <div className="text-[10px] text-slate-400">
            WAVE {waveInfo.current} / {waveInfo.total}
          </div>
        </div>

        {/* Right: Kills, Screenshot & Pause Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">KILLS</span>
            <span className="text-emerald-400 font-bold">{stats.enemiesDefeated}</span>
          </div>

          {/* Instant In-Game Screenshot Button */}
          <button
            onClick={handleTakeScreenshot}
            className={`p-1.5 rounded-lg border transition-all ${
              screenshotSuccess
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
                : 'bg-slate-900 hover:bg-slate-800 border-cyan-500/40 text-cyan-400 hover:text-cyan-200'
            }`}
            title="Take Gameplay Screenshot"
          >
            {screenshotSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Camera className="w-4 h-4" />}
          </button>

          <button
            onClick={togglePause}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Pause [ESC]"
          >
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Boss Health Bar (When Boss Active) */}
      {bossState && bossState.active && (
        <div className="w-full max-w-[480px] bg-rose-950/80 border-x border-rose-500/50 px-4 py-1.5 flex flex-col gap-1 z-20 backdrop-blur-md animate-pulse">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-rose-300 font-bold flex items-center gap-1 uppercase">
              <Skull className="w-3.5 h-3.5 text-rose-400" /> {bossState.name}
            </span>
            <span className="text-rose-400 font-bold">
              {Math.ceil(bossState.current)} / {bossState.max} HP
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-rose-800">
            <div
              className="bg-gradient-to-r from-rose-600 via-orange-500 to-yellow-400 h-full transition-all duration-150"
              style={{ width: `${Math.max(0, bossState.percent * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Phaser Canvas Container */}
      <div className="relative w-full max-w-[480px] h-[640px] sm:h-[700px]">
        <PhaserGame
          mission={mission}
          shipConfig={shipConfig}
          upgrades={currentUpgrades}
          onStatsUpdate={(newStats) => setStats((prev) => ({ ...prev, ...newStats }))}
          onBossHealthUpdate={(hp) => setBossState((prev) => ({ ...prev, active: true, ...hp }))}
          onBossSpawn={(name) => setBossState({ active: true, name, current: 1000, max: 1000, percent: 1 })}
          onWaveStart={(w, total) => setWaveInfo({ current: w, total })}
          onMissionEnd={handleMissionEnd}
          gameInstanceRef={gameInstanceRef}
        />

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 rounded-xl">
            <div className="sci-fi-panel p-6 rounded-2xl border border-cyan-500/40 w-full max-w-xs space-y-4">
              <h3 className="font-heading font-extrabold text-2xl text-cyan-300 glow-cyan">
                TACTICAL PAUSE
              </h3>
              <p className="text-xs text-slate-300">
                Mission sequence halted. Resume combat or return to orbital hangar.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  onClick={togglePause}
                  className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold font-heading text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-black" /> Resume Combat
                </button>
                <button
                  onClick={handleRestart}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Restart Run
                </button>
                <Link
                  to="/campaign"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 block"
                >
                  <Home className="w-4 h-4" /> Abort To Campaign
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Defeat Overlay */}
        {missionResult && missionResult.status === 'DEFEAT' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 rounded-xl">
            <div className="sci-fi-panel p-6 rounded-2xl border border-rose-500/50 w-full max-w-sm space-y-4 shadow-[0_0_35px_rgba(244,63,94,0.3)]">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-950/80 border border-rose-500/60 flex items-center justify-center text-rose-400">
                <Skull className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-extrabold text-2xl text-rose-400">
                MISSION FAILED
              </h3>
              <p className="text-xs text-slate-300">
                Hull integrity collapsed under heavy hostile bombardment.
              </p>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-400 space-y-1 text-left">
                <div className="flex justify-between">
                  <span>Enemies Defeated:</span>
                  <span className="text-white font-bold">{missionResult.enemiesDefeated}</span>
                </div>
                <div className="flex justify-between">
                  <span>Combat Score:</span>
                  <span className="text-cyan-400 font-bold">{missionResult.score.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Salvaged Credits:</span>
                  <span className="text-amber-400 font-bold">+{missionResult.creditsEarned} CR</span>
                </div>
              </div>

              {/* Optional Rewarded Ad: Revive Checkpoint (Max 1) */}
              {!reviveUsed ? (
                <button
                  onClick={openReviveAd}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold font-heading text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4 fill-black" />
                  Watch Ad ➔ Revive (Checkpoint)
                </button>
              ) : (
                <div className="text-[11px] font-mono text-slate-500">
                  Revive opportunity already utilized for this session.
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restart
                </button>
                <Link
                  to="/hangar"
                  className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Rocket className="w-3.5 h-3.5" /> Hangar
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Victory Results Overlay */}
        {missionResult && missionResult.status === 'VICTORY' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 rounded-xl overflow-y-auto">
            <div className="sci-fi-panel p-6 rounded-2xl border border-cyan-400/50 w-full max-w-sm space-y-4 shadow-[0_0_35px_rgba(6,182,212,0.35)]">
              
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                  SECTOR ENGAGEMENT CONCLUDED
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-white glow-cyan">
                  MISSION ACCOMPLISHED!
                </h3>
              </div>

              {/* Glowing Stars Display */}
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={starIdx}
                    className={`w-8 h-8 transition-all ${
                      starIdx <= missionResult.stars
                        ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] scale-110'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Performance Telemetry Matrix */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Final Combat Score:</span>
                  <span className="text-cyan-300 font-bold text-sm">{missionResult.score.toLocaleString()} PTS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mission Duration:</span>
                  <span className="text-slate-200">{missionResult.duration}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hostiles Defeated:</span>
                  <span className="text-emerald-400 font-bold">{missionResult.enemiesDefeated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Targeting Accuracy:</span>
                  <span className="text-sky-300">{missionResult.accuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hull Damage Sustained:</span>
                  <span className="text-rose-400">{missionResult.damageTaken} HP</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between">
                  <span className="text-amber-400 font-bold">Credits Awarded:</span>
                  <span className="text-amber-300 font-bold">+{missionResult.creditsEarned} CR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-400 font-bold">Pilot XP Granted:</span>
                  <span className="text-cyan-300 font-bold">+{missionResult.xpEarned} XP</span>
                </div>
              </div>

              {/* Rewarded Ad Offers: Double Credits & Double Score */}
              <div className="space-y-2 pt-1">
                {!doubleCreditsClaimed ? (
                  <button
                    onClick={openDoubleCreditsAd}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold font-heading text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    <Gift className="w-4 h-4 fill-black" />
                    Watch Ad ➔ Double Credits (+{missionResult.creditsEarned} CR)
                  </button>
                ) : (
                  <div className="text-[11px] font-mono text-emerald-400 flex items-center justify-center gap-1">
                    ✓ Double Credits Authenticated & Awarded!
                  </div>
                )}

                {!doubleScoreClaimed && (
                  <button
                    onClick={openDoubleScoreAd}
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-yellow-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trophy className="w-3.5 h-3.5" /> Watch Ad ➔ Double Score ({missionResult.score * 2} PTS)
                  </button>
                )}
              </div>

              {/* Next Mission / Exit Button */}
              <div className="flex items-center gap-2 pt-2">
                <Link
                  to="/campaign"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
                >
                  Sector Map
                </Link>
                {mission.sequence < 50 && (
                  <Link
                    to={`/game/m-${mission.sequence + 1}`}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold font-heading text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-1"
                  >
                    <span>Next Mission</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Bottom Power-Ups Trigger Bar (Desktop 1-8 keys + Mobile Touch Buttons) */}
      <div className="w-full max-w-[480px] bg-slate-950/90 border border-cyan-500/30 rounded-b-xl p-2.5 flex items-center justify-between gap-1 overflow-x-auto z-20 backdrop-blur-md">
        {POWERUPS_DATA.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => triggerPowerup(p.id)}
            title={`${p.name} (Press ${idx + 1})`}
            className="group relative flex flex-col items-center p-1.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-500/50 transition-all shrink-0 active:scale-95"
          >
            <img src={p.icon} alt={p.name} className="w-6 h-6 object-contain" />
            <span className="text-[9px] font-mono font-bold text-slate-400 group-hover:text-cyan-300 mt-0.5">
              [{idx + 1}]
            </span>
          </button>
        ))}
      </div>

      {/* Rewarded Ad Simulation Modal */}
      <SimulatedAdModal
        isOpen={adModalOpen}
        onClose={() => setAdModalOpen(false)}
        placement={adPlacement}
        sessionId={sessionId}
        onRewardGranted={handleRewardGranted}
        title={
          adPlacement === 'REVIVE'
            ? 'Emergency Shield Revive'
            : adPlacement === 'DOUBLE_CREDITS'
            ? 'Double Mission Credits'
            : 'Double Mission High Score'
        }
        description={
          adPlacement === 'REVIVE'
            ? 'Complete this 5-second simulated broadcast to restore 60% hull integrity and resume your mission.'
            : 'Authenticate this simulated sponsorship transmission to double your earned currency ledger.'
        }
      />

    </div>
  );
}
