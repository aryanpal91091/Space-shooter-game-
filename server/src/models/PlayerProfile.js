import mongoose from 'mongoose';

const PlayerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  level: {
    type: Number,
    default: 1,
  },
  xp: {
    type: Number,
    default: 0,
  },
  selectedShipId: {
    type: String,
    default: 'interceptor',
  },
  stats: {
    enemiesKilled: { type: Number, default: 0 },
    bossesKilled: { type: Number, default: 0 },
    missionsCompleted: { type: Number, default: 0 },
    damageDealt: { type: Number, default: 0 },
    damageTaken: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
  },
  dailyStreak: {
    type: Number,
    default: 1,
  },
  lastLoginDate: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('PlayerProfile', PlayerProfileSchema);
