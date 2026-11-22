import mongoose from 'mongoose';

const PlayerShipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shipId: {
    type: String,
    required: true,
  },
  unlocked: {
    type: Boolean,
    default: false,
  },
  upgrades: {
    weaponDamage: { type: Number, default: 1, min: 1, max: 5 },
    fireRate: { type: Number, default: 1, min: 1, max: 5 },
    maxHealth: { type: Number, default: 1, min: 1, max: 5 },
    moveSpeed: { type: Number, default: 1, min: 1, max: 5 },
    shieldCapacity: { type: Number, default: 1, min: 1, max: 5 },
    specialCooldown: { type: Number, default: 1, min: 1, max: 5 },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

PlayerShipSchema.index({ user: 1, shipId: 1 }, { unique: true });

export default mongoose.model('PlayerShip', PlayerShipSchema);
