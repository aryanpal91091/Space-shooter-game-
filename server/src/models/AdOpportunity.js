import mongoose from 'mongoose';

const AdOpportunitySchema = new mongoose.Schema({
  opportunityId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
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
  placement: {
    type: String,
    enum: ['REVIVE', 'DOUBLE_SCORE', 'DOUBLE_CREDITS', 'EMERGENCY_SHIELD', 'DAILY_BONUS'],
    required: true,
  },
  provider: {
    type: String,
    default: 'SIMULATED_TEST_AD_NETWORK',
  },
  status: {
    type: String,
    enum: [
      'OFFERED',
      'REQUESTED',
      'AD_STARTED',
      'AD_COMPLETED',
      'VERIFYING',
      'VERIFIED',
      'GRANTED',
      'REJECTED',
      'EXPIRED',
    ],
    default: 'OFFERED',
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  claimedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('AdOpportunity', AdOpportunitySchema);
