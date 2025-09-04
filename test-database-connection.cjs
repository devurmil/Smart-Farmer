#!/usr/bin/env node

/**
 * Test database connection
 * This script will help diagnose database connection issues
 */

require('dotenv').config();

console.log('🔍 Testing database connection...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
console.log('  DB_HOST:', process.env.DB_HOST || 'Not Set');
console.log('  DB_NAME:', process.env.DB_NAME || 'Not Set');
console.log('  DB_USER:', process.env.DB_USER || 'Not Set');
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? 'Set' : 'Not Set');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');

// Test database connection
const { testConnection } = require('./backend/config/database');

async function testDB() {
  try {
    await testConnection();
    console.log('\n✅ Database connection successful!');
  } catch (error) {
    console.log('\n❌ Database connection failed:');
    console.log('   Error:', error.message);
    
    if (process.env.NODE_ENV === 'production') {
      console.log('\n🔧 For production (Render):');
      console.log('   1. Go to your Render dashboard');
      console.log('   2. Select your service');
      console.log('   3. Go to Environment > Environment Variables');
      console.log('   4. Add DATABASE_URL with your PostgreSQL connection string');
      console.log('   5. Format: postgresql://username:password@host:port/database');
    } else {
      console.log('\n🔧 For local development:');
      console.log('   1. Install MySQL or use a cloud database');
      console.log('   2. Update .env file with correct database credentials');
      console.log('   3. Or set DATABASE_URL for a cloud database');
    }
  }
}

testDB();
