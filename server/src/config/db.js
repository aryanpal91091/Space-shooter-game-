import mongoose from 'mongoose';
import { MONGODB_URI } from './gameConfig.js';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    if (MONGODB_URI && MONGODB_URI.trim() !== '') {
      console.log('Connecting to configured MongoDB URI...');
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ Connected to MongoDB at:', MONGODB_URI.split('@')[1] || MONGODB_URI);
      return;
    }
  } catch (err) {
    console.warn('⚠️ Configured MongoDB URI connection failed, falling back to embedded in-memory MongoDB:', err.message);
  }

  try {
    console.log('Initializing embedded MongoDB Memory Server for local development/testing...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const uri = mongodInstance.getUri();
    await mongoose.connect(uri);
    console.log('✅ Connected to embedded In-Memory MongoDB:', uri);
    await seedDemoPilot();
  } catch (fallbackErr) {
    console.error('❌ Failed to connect to any MongoDB instance:', fallbackErr.message);
    throw fallbackErr;
  }
};

const seedDemoPilot = async () => {
  try {
    const User = (await import('../models/User.js')).default;
    const existing = await User.findOne({ email: 'pilot@veloop.io' });
    if (!existing) {
      const bcrypt = (await import('bcryptjs')).default;
      const Wallet = (await import('../models/Wallet.js')).default;
      const PlayerProfile = (await import('../models/PlayerProfile.js')).default;
      const PlayerShip = (await import('../models/PlayerShip.js')).default;
      const PlayerInventory = (await import('../models/PlayerInventory.js')).default;
      const PlayerMissionProgress = (await import('../models/PlayerMissionProgress.js')).default;

      const passwordHash = await bcrypt.hash('Odyssey2026!', 10);
      const user = await User.create({
        username: 'CommanderPilot',
        email: 'pilot@veloop.io',
        passwordHash,
      });

      await Wallet.create({ user: user._id, credits: 1000, energyCores: 5 });
      await PlayerProfile.create({ user: user._id, level: 1, xp: 0 });
      await PlayerShip.create({ user: user._id, shipId: 'interceptor', unlocked: true });
      await PlayerInventory.create({ user: user._id });
      await PlayerMissionProgress.create({ user: user._id, missionId: 'm-1', unlocked: true });
      console.log('✅ Demo pilot account ready: pilot@veloop.io / Odyssey2026!');
    }
  } catch (err) {
    console.warn('Demo seed notice:', err.message);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error('Error disconnecting DB:', err.message);
  }
};
