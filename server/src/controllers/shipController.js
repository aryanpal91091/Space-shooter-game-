import PlayerShip from '../models/PlayerShip.js';
import PlayerProfile from '../models/PlayerProfile.js';
import { WalletService } from '../services/economy/walletService.js';
import { ECONOMY_CONFIG } from '../config/economyConfig.js';

const SHIP_PRICING = {
  interceptor: { credits: 0, energyCores: 0 },
  striker: { credits: 1500, energyCores: 2 },
  guardian: { credits: 2800, energyCores: 4 },
  support: { credits: 4000, energyCores: 6 },
  experimental: { credits: 8000, energyCores: 12 },
};

export const getOwnedShips = async (req, res, next) => {
  try {
    const ships = await PlayerShip.find({ user: req.user._id, unlocked: true });
    const profile = await PlayerProfile.findOne({ user: req.user._id });

    const unlockedShips = ships.map(s => s.shipId);
    if (!unlockedShips.includes('interceptor')) unlockedShips.push('interceptor');

    const upgrades = {};
    ships.forEach(s => {
      upgrades[s.shipId] = s.upgrades;
    });

    res.status(200).json({
      unlockedShips,
      selectedShipId: profile?.selectedShipId || 'interceptor',
      upgrades,
    });
  } catch (err) {
    next(err);
  }
};

export const selectShip = async (req, res, next) => {
  try {
    const { shipId } = req.params;
    let profile = await PlayerProfile.findOne({ user: req.user._id });
    if (!profile) profile = new PlayerProfile({ user: req.user._id });

    profile.selectedShipId = shipId;
    await profile.save();

    res.status(200).json({ message: `Active flagship updated to ${shipId}`, selectedShipId: shipId });
  } catch (err) {
    next(err);
  }
};

export const unlockShip = async (req, res, next) => {
  try {
    const { shipId } = req.params;
    const cost = SHIP_PRICING[shipId];

    if (!cost) {
      return res.status(400).json({ message: 'Invalid ship identifier.' });
    }

    const existing = await PlayerShip.findOne({ user: req.user._id, shipId, unlocked: true });
    if (existing) {
      return res.status(400).json({ message: 'This ship is already commissioned in your hangar.' });
    }

    // Debit credits
    let walletRes = null;
    if (cost.credits > 0) {
      walletRes = await WalletService.debit(req.user._id, cost.credits, 'UPGRADE_PURCHASE', `UNLOCK_SHIP_${shipId}`, null, 'CREDITS');
    }
    // Debit energy cores if needed
    if (cost.energyCores > 0) {
      walletRes = await WalletService.debit(req.user._id, cost.energyCores, 'UPGRADE_PURCHASE', `UNLOCK_SHIP_CORES_${shipId}`, null, 'ENERGY_CORES');
    }

    await PlayerShip.findOneAndUpdate(
      { user: req.user._id, shipId },
      { $set: { unlocked: true } },
      { upsert: true, new: true }
    );

    const allOwned = await PlayerShip.find({ user: req.user._id, unlocked: true });
    res.status(200).json({
      message: `Ship ${shipId} successfully commissioned.`,
      unlockedShips: allOwned.map(s => s.shipId),
      wallet: walletRes?.wallet,
    });
  } catch (err) {
    next(err);
  }
};

export const upgradeShip = async (req, res, next) => {
  try {
    const { shipId } = req.params;
    const { attribute } = req.body;

    let ship = await PlayerShip.findOne({ user: req.user._id, shipId });
    if (!ship) {
      ship = await PlayerShip.create({ user: req.user._id, shipId, unlocked: true });
    }

    const currentLevel = ship.upgrades[attribute] || 1;
    if (currentLevel >= 5) {
      return res.status(400).json({ message: 'System is already at maximum performance tier (5).' });
    }

    const baseCost = ECONOMY_CONFIG.upgradePricing[attribute] || 150;
    const upgradeCost = currentLevel * baseCost;

    // Deduct currency atomically
    const debitRes = await WalletService.debit(
      req.user._id,
      upgradeCost,
      'UPGRADE_PURCHASE',
      `SHIP_${shipId}_UPGRADE_${attribute}_LVL${currentLevel + 1}`
    );

    ship.upgrades[attribute] = currentLevel + 1;
    await ship.save();

    res.status(200).json({
      message: `Upgraded ${attribute} to Level ${currentLevel + 1}`,
      upgrades: ship.upgrades,
      wallet: debitRes.wallet,
    });
  } catch (err) {
    next(err);
  }
};
