import mongoose from 'mongoose';

const WalletTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'CREDIT',
      'DEBIT',
      'MISSION_REWARD',
      'BOSS_REWARD',
      'AD_REWARD',
      'UPGRADE_PURCHASE',
      'BOOSTER_PURCHASE',
      'DAILY_BONUS',
      'REVERSAL',
    ],
    required: true,
  },
  currency: {
    type: String,
    enum: ['CREDITS', 'ENERGY_CORES', 'VELOOP_COINS'],
    default: 'CREDITS',
  },
  amount: {
    type: Number,
    required: true,
  },
  balanceBefore: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  referenceId: {
    type: String,
    default: null,
    index: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REJECTED'],
    default: 'COMPLETED',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

export default mongoose.model('WalletTransaction', WalletTransactionSchema);
