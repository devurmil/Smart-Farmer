#!/usr/bin/env node

/**
 * Test MongoDB connection using mongoose
 */

require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB connection...\n');

const mongoUrl = process.env.MONGO_URL || process.env.DATABASE_URL;

console.log('Environment Variables:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'Not Set');
console.log('  MONGO_URL:', mongoUrl ? 'Set' : 'Not Set');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');

if (!mongoUrl) {
  console.log('\n❌ Missing MONGO_URL / DATABASE_URL.');
  console.log('   Add one of the following to your environment variables:');
  console.log('   MONGO_URL=mongodb://localhost:27017/smart_farmer');
  console.log('   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/smart_farmer');
  process.exit(1);
}

async function testDB() {
  try {
    await mongoose.connect(mongoUrl, {
      maxPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
    });

    console.log('\n✅ MongoDB connection successful!');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
  } catch (error) {
    console.log('\n❌ MongoDB connection failed:');
    console.log('   Error:', error.message);

    if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
      console.log('\n🔧 For production (Render):');
      console.log('   1. Set MONGO_URL in Render → Environment → Environment Variables.');
      console.log('   2. Use your MongoDB Atlas connection string (mongodb+srv://...).');
      console.log('   3. Ensure the cluster allows connections from Render IP ranges.');
      console.log('   4. Verify username/password and database name are correct.');
    } else {
      console.log('\n🔧 For local development:');
      console.log('   1. Ensure MongoDB is running locally (mongod).');
      console.log('   2. Use MONGO_URL=mongodb://localhost:27017/smart_farmer in your .env.');
      console.log('   3. If using Atlas, allow your local IP in the network rules.');
    }
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

testDB();
