import mongoose from 'mongoose';

const PlayerMissionProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  missionId: {
    type: String,
    required: true,
  },
  unlocked: {
    type: Boolean,
    default: false,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  stars: {
    type: Number,
    default: 0,
    min: 0,
    max: 3,
  },
  bestScore: {
    type: Number,
    default: 0,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

PlayerMissionProgressSchema.index({ user: 1, missionId: 1 }, { unique: true });

export default mongoose.model('PlayerMissionProgress', PlayerMissionProgressSchema);
