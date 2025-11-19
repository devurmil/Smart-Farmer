#!/usr/bin/env node

/**
 * Validate MongoDB connection strings (MONGO_URL / DATABASE_URL)
 */

require('dotenv').config();

console.log('🔍 Testing MongoDB connection string...\n');

const mongoUrl = process.env.MONGO_URL || process.env.DATABASE_URL;

if (!mongoUrl) {
  console.log('❌ Neither MONGO_URL nor DATABASE_URL is set.');
  console.log('   Add one of the following to your environment variables:');
  console.log('   MONGO_URL=mongodb://localhost:27017/smart_farmer');
  console.log('   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/smart_farmer');
  process.exit(1);
}

const isMongoProtocol =
  mongoUrl.startsWith('mongodb://') || mongoUrl.startsWith('mongodb+srv://');

if (!isMongoProtocol) {
  console.log('❌ Connection string must start with mongodb:// or mongodb+srv://');
  console.log('   Current value:', mongoUrl.split('://')[0] + '://...');
  process.exit(1);
}

const normalizeForUrl = (value) =>
  value.replace(/^mongodb(\+srv)?:\/\//, 'http://');

try {
  const parsed = new URL(normalizeForUrl(mongoUrl));
  const protocol = mongoUrl.startsWith('mongodb+srv://')
    ? 'mongodb+srv:'
    : 'mongodb:';

  console.log('✅ Connection string detected!');
  console.log('   Protocol:', protocol);
  console.log('   Username:', parsed.username || 'Not set');
  console.log('   Password:', parsed.password ? '***' : 'Not set');
  console.log('   Hostname:', parsed.hostname || 'Not set');
  console.log('   Port:', parsed.port || 'Default');
  console.log(
    '   Database:',
    parsed.pathname && parsed.pathname !== '/'
      ? parsed.pathname.slice(1)
      : 'Not set'
  );

  if (!parsed.username || !parsed.password) {
    console.log('\n⚠️  Warning: Username or password missing.');
    console.log('   Atlas/SRV URLs typically require both.');
  }

  if (!parsed.pathname || parsed.pathname === '/') {
    console.log('\n⚠️  Warning: Database name missing.');
    console.log(
      '   Append your DB name to the URL, e.g., mongodb://user:pass@host/dbname'
    );
  }

  console.log('\n🎉 Connection string looks valid.');
  console.log(
    '   Run `node test-database-connection.cjs` to verify connectivity.'
  );
} catch (error) {
  console.log('\n❌ Failed to parse MongoDB connection string.');
  console.log('   Error:', error.message);
  console.log('\n🔧 Tips:');
  console.log('   - Ensure the URL contains no spaces or line breaks.');
  console.log('   - Keep special characters URL-encoded.');
  console.log('   - Include a database name at the end.');
  process.exit(1);
}

console.log('\n🎯 Next steps:');
console.log('   1. If the details above look correct, you can deploy.');
console.log('   2. Otherwise, fix the issues and re-run this script.');
console.log('   3. Use MongoDB Atlas or a self-hosted Mongo server as needed.');
