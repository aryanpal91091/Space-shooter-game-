import mongoose from 'mongoose';

const DailyClaimSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  claimDate: {
    type: String, // YYYY-MM-DD server date format
    required: true,
  },
  streakDay: {
    type: Number,
    required: true,
  },
  reward: {
    credits: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    energyCores: { type: Number, default: 0 },
  },
  claimedAt: {
    type: Date,
    default: Date.now,
  },
});

DailyClaimSchema.index({ user: 1, claimDate: 1 }, { unique: true });

export default mongoose.model('DailyClaim', DailyClaimSchema);
