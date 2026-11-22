import mongoose from 'mongoose';

const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  credits: {
    type: Number,
    default: 500, // Initial pilot starter grant
    min: 0,
  },
  energyCores: {
    type: Number,
    default: 2, // Initial starter cores
    min: 0,
  },
  veloopCoins: {
    type: Number,
    default: 0, // Separated platform-eligible currency
    min: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Wallet', WalletSchema);
