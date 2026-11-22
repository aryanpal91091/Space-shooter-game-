import Wallet from '../models/Wallet.js';
import WalletTransaction from '../models/WalletTransaction.js';
import RewardTransaction from '../models/RewardTransaction.js';
import PlayerProfile from '../models/PlayerProfile.js';
import { ECONOMY_CONFIG } from '../config/economyConfig.js';

export const getEconomyConfig = (req, res) => {
  res.status(200).json(ECONOMY_CONFIG);
};

export const getWalletBalance = async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id });
    }
    const profile = await PlayerProfile.findOne({ user: req.user._id });

    res.status(200).json({
      credits: wallet.credits,
      energyCores: wallet.energyCores,
      veloopCoins: wallet.veloopCoins,
      xp: profile?.xp || 0,
      level: profile?.level || 1,
    });
  } catch (err) {
    next(err);
  }
};

export const getWalletHistory = async (req, res, next) => {
  try {
    const transactions = await WalletTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ transactions });
  } catch (err) {
    next(err);
  }
};

export const getRewardHistory = async (req, res, next) => {
  try {
    const rewards = await RewardTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ rewards });
  } catch (err) {
    next(err);
  }
};
