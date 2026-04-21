const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    // Skip MongoDB connection if SKIP_MONGODB is set (for development without MongoDB)
    if (process.env.SKIP_MONGODB === 'true') {
      console.log('Skipping MongoDB connection (SKIP_MONGODB=true)');
      return;
    }
    
    const mongodbUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
    
    if (!mongodbUri) {
      console.warn('--- DATABASE CONFIGURATION WARNING ---');
      console.warn('No MONGODB_URI found in environment variables.');
      console.warn('Current NODE_ENV:', process.env.NODE_ENV);
      
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGODB_URI is REQUIRED in production mode. Please check your Railway environment variables.');
      }
      console.warn('Falling back to local: mongodb://127.0.0.1:27017/prepmaster');
      console.warn('--------------------------------------');
    } else {
      // Log masked URI for debugging (e.g., mongodb+srv://user:****@cluster.abc.mongodb.net/db)
      const maskedUri = mongodbUri.replace(/:([^:@]{3,})@/, ':****@');
      console.log(`Attempting to connect to: ${maskedUri}`);
    }
    
    const conn = await mongoose.connect(mongodbUri || 'mongodb://127.0.0.1:27017/prepmaster', {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    isConnected = true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: Your database is not connected! Make sure your MONGODB_URI is valid and your database is online.');
    }
    
    isConnected = false;
    // Don't exit process in development to allow server to run without DB for testing
    if (process.env.NODE_ENV === 'production') {
      // On Railway, you might want to exit to signal a failed startup
      // process.exit(1); 
    }
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
