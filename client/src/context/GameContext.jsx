import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { soundSystem } from '../utils/audioSystem';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const { user } = useAuth();

  // Local fallback state initialized with starting beginner balance
  const [wallet, setWallet] = useState({
    credits: 500,
    energyCores: 2,
    xp: 0,
    level: 1,
    veloopCoins: 0,
  });

  const [selectedShipId, setSelectedShipId] = useState('interceptor');
  const [unlockedShips, setUnlockedShips] = useState(['interceptor']);
  const [shipUpgrades, setShipUpgrades] = useState({
    interceptor: { weaponDamage: 1, fireRate: 1, maxHealth: 1, moveSpeed: 1, shieldCapacity: 1, specialCooldown: 1 },
    striker: { weaponDamage: 1, fireRate: 1, maxHealth: 1, moveSpeed: 1, shieldCapacity: 1, specialCooldown: 1 },
    guardian: { weaponDamage: 1, fireRate: 1, maxHealth: 1, moveSpeed: 1, shieldCapacity: 1, specialCooldown: 1 },
    support: { weaponDamage: 1, fireRate: 1, maxHealth: 1, moveSpeed: 1, shieldCapacity: 1, specialCooldown: 1 },
    experimental: { weaponDamage: 1, fireRate: 1, maxHealth: 1, moveSpeed: 1, shieldCapacity: 1, specialCooldown: 1 },
  });

  const [unlockedMissions, setUnlockedMissions] = useState(['m-1']);
  const [completedMissions, setCompletedMissions] = useState({});
  const [inventory, setInventory] = useState({
    shield_pulse: 2,
    rapid_fire: 2,
    spread_shot: 1,
    homing_missiles: 2,
    emp_blast: 1,
    repair_drone: 2,
    overdrive: 1,
    emergency_warp: 2,
  });

  const [dailyStreak, setDailyStreak] = useState(1);
  const [lastDailyClaim, setLastDailyClaim] = useState(null);

  // Audio state
  const [audioSettings, setAudioSettings] = useState({
    sfx: soundSystem.sfxVolume,
    music: soundSystem.musicVolume,
    muted: soundSystem.muted,
  });

  // Fetch persistent user state from backend when authenticated
  const fetchUserData = async () => {
    if (!user) return;
    try {
      const [walletRes, progressRes, fleetRes, invRes] = await Promise.allSettled([
        api.get('/wallet/balance'),
        api.get('/player/progress'),
        api.get('/ships/owned'),
        api.get('/player/inventory'),
      ]);

      if (walletRes.status === 'fulfilled' && walletRes.value.data) {
        setWallet(walletRes.value.data);
      }
      if (progressRes.status === 'fulfilled' && progressRes.value.data) {
        if (progressRes.value.data.unlockedMissions) {
          setUnlockedMissions(progressRes.value.data.unlockedMissions);
        }
        if (progressRes.value.data.completedMissions) {
          setCompletedMissions(progressRes.value.data.completedMissions);
        }
        if (progressRes.value.data.dailyStreak) {
          setDailyStreak(progressRes.value.data.dailyStreak);
        }
      }
      if (fleetRes.status === 'fulfilled' && fleetRes.value.data) {
        if (fleetRes.value.data.unlockedShips) {
          setUnlockedShips(fleetRes.value.data.unlockedShips);
        }
        if (fleetRes.value.data.selectedShipId) {
          setSelectedShipId(fleetRes.value.data.selectedShipId);
        }
        if (fleetRes.value.data.upgrades) {
          setShipUpgrades(prev => ({ ...prev, ...fleetRes.value.data.upgrades }));
        }
      }
      if (invRes.status === 'fulfilled' && invRes.value.data) {
        setInventory(invRes.value.data);
      }
    } catch (err) {
      console.warn('Backend sync in progress:', err.message);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  // Audio handlers
  const updateAudio = (key, val) => {
    if (key === 'sfx') {
      soundSystem.setSfxVolume(val);
      setAudioSettings(prev => ({ ...prev, sfx: val }));
    } else if (key === 'music') {
      soundSystem.setMusicVolume(val);
      setAudioSettings(prev => ({ ...prev, music: val }));
    } else if (key === 'muted') {
      const isMuted = soundSystem.toggleMute();
      setAudioSettings(prev => ({ ...prev, muted: isMuted }));
    }
  };

  // Upgrades and Purchases
  const upgradeShipAttribute = async (shipId, attribute, cost) => {
    if (wallet.credits < cost) {
      throw new Error('Insufficient Credits!');
    }

    try {
      // Try backend authoritative upgrade
      const res = await api.post(`/ships/${shipId}/upgrade`, { attribute });
      if (res.data?.wallet) setWallet(res.data.wallet);
      if (res.data?.upgrades) {
        setShipUpgrades(prev => ({
          ...prev,
          [shipId]: { ...prev[shipId], ...res.data.upgrades }
        }));
      }
    } catch {
      // Optimistic local fallback for smooth experience
      setWallet(prev => ({ ...prev, credits: prev.credits - cost }));
      setShipUpgrades(prev => ({
        ...prev,
        [shipId]: {
          ...prev[shipId],
          [attribute]: (prev[shipId]?.[attribute] || 1) + 1,
        }
      }));
    }
  };

  const unlockShip = async (shipId, costCredits = 0, costEnergyCores = 0) => {
    if (wallet.credits < costCredits || wallet.energyCores < costEnergyCores) {
      throw new Error('Insufficient funds to unlock this vessel!');
    }

    try {
      const res = await api.post(`/ships/${shipId}/unlock`);
      if (res.data?.unlockedShips) setUnlockedShips(res.data.unlockedShips);
      if (res.data?.wallet) setWallet(res.data.wallet);
    } catch {
      setWallet(prev => ({
        ...prev,
        credits: prev.credits - costCredits,
        energyCores: prev.energyCores - costEnergyCores,
      }));
      setUnlockedShips(prev => [...new Set([...prev, shipId])]);
    }
  };

  const selectShip = async (shipId) => {
    setSelectedShipId(shipId);
    try {
      await api.post(`/ships/${shipId}/select`);
    } catch (_) {}
  };

  const acquirePowerup = async (powerUpId, costCredits) => {
    if (wallet.credits < costCredits) {
      throw new Error('Insufficient Credits to buy this power-up!');
    }
    try {
      const res = await api.post(`/powerups/${powerUpId}/acquire`);
      if (res.data?.inventory) setInventory(res.data.inventory);
      if (res.data?.wallet) setWallet(res.data.wallet);
    } catch {
      setWallet(prev => ({ ...prev, credits: prev.credits - costCredits }));
      setInventory(prev => ({ ...prev, [powerUpId]: (prev[powerUpId] || 0) + 1 }));
    }
  };

  return (
    <GameContext.Provider
      value={{
        wallet,
        setWallet,
        selectedShipId,
        selectShip,
        unlockedShips,
        unlockShip,
        shipUpgrades,
        upgradeShipAttribute,
        unlockedMissions,
        setUnlockedMissions,
        completedMissions,
        setCompletedMissions,
        inventory,
        acquirePowerup,
        dailyStreak,
        lastDailyClaim,
        audioSettings,
        updateAudio,
        refreshUserData: fetchUserData,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
