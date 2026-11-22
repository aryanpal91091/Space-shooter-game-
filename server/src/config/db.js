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
  } catch (fallbackErr) {
    console.error('❌ Failed to connect to any MongoDB instance:', fallbackErr.message);
    throw fallbackErr;
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
