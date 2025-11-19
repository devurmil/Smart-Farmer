const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Load .env from root

// Check if we're in production (Render deployment)
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;

console.log('🔧 Database Configuration:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   RENDER:', process.env.RENDER);
console.log('   MONGO_URL:', process.env.MONGO_URL ? 'Set' : 'Not Set');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not Set');

// Helper function to detect MongoDB URLs
const isMongoDBUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('mongodb://') || url.startsWith('mongodb+srv://');
};

// Get MongoDB connection string
let mongoUrl = process.env.MONGO_URL || process.env.DATABASE_URL;

if (!mongoUrl) {
  if (isProduction) {
    console.error('❌ CRITICAL ERROR: MONGO_URL or DATABASE_URL is required in production!');
    console.error('   Please set the MONGO_URL environment variable in your Render dashboard.');
    console.error('   Go to: Render Dashboard > Your Service > Environment > Environment Variables');
    console.error('   Add: MONGO_URL = mongodb+srv://username:password@cluster.mongodb.net/database');
    process.exit(1);
  } else {
    console.error('❌ MONGO_URL is not set for local development');
    console.error('   Please add MONGO_URL to your .env file:');
    console.error('   MONGO_URL=mongodb://localhost:27017/smart_farmer');
    process.exit(1);
  }
}

// Validate MongoDB URL format
if (!isMongoDBUrl(mongoUrl)) {
  console.error('❌ ERROR: Invalid MongoDB connection string!');
  console.error('   Expected format: mongodb:// or mongodb+srv://');
  console.error('   Your URL:', mongoUrl.substring(0, 50) + '...');
  process.exit(1);
}

// MongoDB connection options
const mongooseOptions = {
  // Remove deprecated options and use recommended ones
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};

// Test database connection
const connectDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('   URL:', mongoUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(mongoUrl, mongooseOptions);
    
    console.log('✅ MongoDB connected successfully.');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
    console.log('   Port:', mongoose.connection.port || 'default');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ Unable to connect to MongoDB:', error.message);
    
    if (isProduction) {
      console.error('   This is a production deployment. Please check:');
      console.error('   1. MONGO_URL environment variable is set correctly');
      console.error('   2. MongoDB server is accessible from Render');
      console.error('   3. Database credentials are valid');
      console.error('   4. MongoDB cluster is running');
      console.error('   5. Network access is allowed from Render IPs');
      console.error('   6. MONGO_URL format is correct');
      console.error('      Expected: mongodb+srv://username:password@cluster.mongodb.net/database');
    } else {
      console.error('   This is a local development environment. Please check:');
      console.error('   1. MongoDB server is running (mongod)');
      console.error('   2. .env file has correct MONGO_URL');
      console.error('   3. Database exists');
    }
    
    process.exit(1);
  }
};

module.exports = { mongoose, connectDatabase };
