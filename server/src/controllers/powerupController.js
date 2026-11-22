import { POWERUPS_DATA } from '../data/powerupsData.js';
import PlayerInventory from '../models/PlayerInventory.js';
import { WalletService } from '../services/economy/walletService.js';

export const getPowerups = async (req, res, next) => {
  try {
    res.status(200).json({ powerups: POWERUPS_DATA });
  } catch (err) {
    next(err);
  }
};

export const acquirePowerup = async (req, res, next) => {
  try {
    const { powerUpId } = req.params;
    const powerup = POWERUPS_DATA.find((p) => p.id === powerUpId);
    if (!powerup) {
      return res.status(404).json({ message: `Unknown power-up system: ${powerUpId}` });
    }

    const cost = powerup.costCredits || 200;

    // Deduct currency atomically through WalletService
    const debitRes = await WalletService.debit(
      req.user._id,
      cost,
      'BOOSTER_PURCHASE',
      `POWERUP_ACQUIRE_${powerUpId}`
    );

    let inventory = await PlayerInventory.findOne({ user: req.user._id });
    if (!inventory) {
      inventory = await PlayerInventory.create({ user: req.user._id });
    }

    const currentCount = inventory.powerups[powerUpId] || 0;
    inventory.powerups[powerUpId] = currentCount + 1;
    await inventory.save();

    res.status(200).json({
      message: `Successfully acquired 1 charge of ${powerup.name}.`,
      powerUpId,
      inventory: inventory.powerups,
      wallet: debitRes.wallet,
    });
  } catch (err) {
    next(err);
  }
};
