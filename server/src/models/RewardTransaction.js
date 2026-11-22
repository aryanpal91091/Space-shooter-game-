import mongoose from 'mongoose';

const RewardTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sessionId: {
    type: String,
    default: null,
  },
  opportunityId: {
    type: String,
    required: true,
    index: true,
  },
  placement: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'CREDITS',
  },
  multiplier: {
    type: Number,
    default: 1.0,
  },
  adProvider: {
    type: String,
    default: 'SIMULATED_TEST_AD_NETWORK',
  },
  verificationStatus: {
    type: String,
    enum: ['VERIFIED', 'MANUAL_GRANT', 'FAILED'],
    default: 'VERIFIED',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('RewardTransaction', RewardTransactionSchema);
