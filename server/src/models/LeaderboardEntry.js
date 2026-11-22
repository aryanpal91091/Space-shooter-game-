import mongoose from 'mongoose';

const LeaderboardEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    index: -1,
  },
  missionsCompleted: {
    type: Number,
    default: 1,
  },
  ship: {
    type: String,
    default: 'Interceptor',
  },
  sessionId: {
    type: String,
    required: true,
  },
  verifiedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('LeaderboardEntry', LeaderboardEntrySchema);
