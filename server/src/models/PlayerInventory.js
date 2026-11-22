import mongoose from 'mongoose';

const PlayerInventorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  powerups: {
    shield_pulse: { type: Number, default: 2 },
    rapid_fire: { type: Number, default: 2 },
    spread_shot: { type: Number, default: 1 },
    homing_missiles: { type: Number, default: 2 },
    emp_blast: { type: Number, default: 1 },
    repair_drone: { type: Number, default: 2 },
    overdrive: { type: Number, default: 1 },
    emergency_warp: { type: Number, default: 2 },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('PlayerInventory', PlayerInventorySchema);
