import mongoose from 'mongoose';

const GameSessionSchema = new mongoose.Schema({
  sessionId: {
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
  missionId: {
    type: String,
    required: true,
    index: true,
  },
  selectedShipId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'DEFEATED', 'VICTORY', 'FAILED'],
    default: 'ACTIVE',
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    default: null,
  },
  durationSeconds: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    default: 0,
  },
  enemiesDefeated: {
    type: Number,
    default: 0,
  },
  bossDefeated: {
    type: Boolean,
    default: false,
  },
  damageTaken: {
    type: Number,
    default: 0,
  },
  stars: {
    type: Number,
    default: 0,
    min: 0,
    max: 3,
  },
  revivesUsed: {
    type: Number,
    default: 0,
  },
  doubleScoreClaimed: {
    type: Boolean,
    default: false,
  },
  doubleCreditsClaimed: {
    type: Boolean,
    default: false,
  },
  claimed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('GameSession', GameSessionSchema);
