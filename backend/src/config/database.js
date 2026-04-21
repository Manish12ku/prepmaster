const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    // Skip MongoDB connection if SKIP_MONGODB is set (for development without MongoDB)
    if (process.env.SKIP_MONGODB === 'true') {
      console.log('Skipping MongoDB connection (SKIP_MONGODB=true)');
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prepmaster');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    isConnected = true;
  } catch (error) {
    const uri = process.env.MONGODB_URI ? 'environment variable' : 'default local';
    console.error(`MongoDB Connection Error (using ${uri}): ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: MongoDB is not connected in production. Ensure MONGODB_URI is set to a valid cloud database.');
    }
    console.log('Running in limited mode without database. Set SKIP_MONGODB=true to suppress this warning.');
    isConnected = false;
    // Don't exit process - allow server to run without DB for frontend testing
  }
};

// Check mongoose connection state
const checkConnection = () => {
  // Mongoose readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const readyState = mongoose.connection.readyState;
  return readyState === 1;
};

module.exports = connectDB;
module.exports.isConnected = checkConnection;
