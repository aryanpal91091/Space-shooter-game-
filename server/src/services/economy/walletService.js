import Wallet from '../../models/Wallet.js';
import WalletTransaction from '../../models/WalletTransaction.js';

export class WalletService {
  /**
   * Atomically credit an amount to user's wallet and log transaction
   */
  static async credit(userId, amount, type, source, referenceId = null, currency = 'CREDITS') {
    if (amount <= 0) throw new Error('Credit amount must be greater than zero');

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    const field = currency === 'ENERGY_CORES' ? 'energyCores' : currency === 'VELOOP_COINS' ? 'veloopCoins' : 'credits';
    const balanceBefore = wallet[field];
    const balanceAfter = balanceBefore + amount;

    wallet[field] = balanceAfter;
    wallet.updatedAt = new Date();
    await wallet.save();

    const tx = await WalletTransaction.create({
      user: userId,
      type,
      currency,
      amount,
      balanceBefore,
      balanceAfter,
      source,
      referenceId,
      status: 'COMPLETED',
    });

    return { wallet, transaction: tx };
  }

  /**
   * Atomically debit an amount from user's wallet with negative balance prevention
   */
  static async debit(userId, amount, type, source, referenceId = null, currency = 'CREDITS') {
    if (amount <= 0) throw new Error('Debit amount must be greater than zero');

    const field = currency === 'ENERGY_CORES' ? 'energyCores' : currency === 'VELOOP_COINS' ? 'veloopCoins' : 'credits';

    // Atomic conditional update to strictly prevent negative balance
    const walletBefore = await Wallet.findOne({ user: userId });
    if (!walletBefore || walletBefore[field] < amount) {
      throw new Error(`Insufficient ${currency}. Available: ${walletBefore ? walletBefore[field] : 0}, Required: ${amount}`);
    }

    const balanceBefore = walletBefore[field];
    const balanceAfter = balanceBefore - amount;

    const updatedWallet = await Wallet.findOneAndUpdate(
      { user: userId, [field]: { $gte: amount } },
      { $inc: { [field]: -amount }, $set: { updatedAt: new Date() } },
      { new: true }
    );

    if (!updatedWallet) {
      throw new Error('Concurrent transaction conflict. Balance deduction rejected.');
    }

    const tx = await WalletTransaction.create({
      user: userId,
      type,
      currency,
      amount,
      balanceBefore,
      balanceAfter,
      source,
      referenceId,
      status: 'COMPLETED',
    });

    return { wallet: updatedWallet, transaction: tx };
  }
}
