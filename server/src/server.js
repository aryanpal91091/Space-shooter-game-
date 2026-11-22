import app from './app.js';
import { connectDB } from './config/db.js';
import { PORT, GAME_NAME } from './config/gameConfig.js';

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 ${GAME_NAME} Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
