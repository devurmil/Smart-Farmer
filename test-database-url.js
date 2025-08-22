#!/usr/bin/env node

/**
 * Test and validate DATABASE_URL format
 * Run this script to check if your DATABASE_URL is properly formatted
 */

require('dotenv').config();

console.log('🔍 Testing DATABASE_URL format...\n');

// Check if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL is not set');
  console.log('   Please set the DATABASE_URL environment variable');
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
console.log('📡 DATABASE_URL found:', databaseUrl ? 'Yes' : 'No');

// Test URL parsing
try {
  const url = new URL(databaseUrl);
  
  console.log('\n✅ URL parsing successful!');
  console.log('   Protocol:', url.protocol);
  console.log('   Username:', url.username || 'Not set');
  console.log('   Password:', url.password ? '***' : 'Not set');
  console.log('   Hostname:', url.hostname);
  console.log('   Port:', url.port || 'Default');
  console.log('   Database:', url.pathname.slice(1) || 'Not set');
  
  // Check if it's a valid database URL
  const isValidProtocol = ['postgresql:', 'postgres:', 'mysql:', 'mariadb:'].includes(url.protocol);
  
  if (!isValidProtocol) {
    console.log('\n⚠️  Warning: Protocol might not be supported');
    console.log('   Supported protocols: postgresql:, postgres:, mysql:, mariadb:');
  }
  
  if (!url.username) {
    console.log('\n⚠️  Warning: No username in DATABASE_URL');
  }
  
  if (!url.password) {
    console.log('\n⚠️  Warning: No password in DATABASE_URL');
  }
  
  if (!url.pathname || url.pathname === '/') {
    console.log('\n⚠️  Warning: No database name specified');
  }
  
  // Test connection components
  const hasRequiredComponents = url.username && url.password && url.hostname && url.pathname && url.pathname !== '/';
  
  if (hasRequiredComponents) {
    console.log('\n🎉 DATABASE_URL appears to be valid!');
    console.log('   All required components are present');
  } else {
    console.log('\n❌ DATABASE_URL is missing required components');
    console.log('   Required: username, password, hostname, database name');
  }
  
  // Show example format
  console.log('\n📝 Expected format:');
  console.log('   postgresql://username:password@hostname:port/database_name');
  console.log('   mysql://username:password@hostname:port/database_name');
  
  // Show your current format
  console.log('\n🔍 Your current format:');
  console.log(`   ${url.protocol}//${url.username || 'username'}:${url.password ? '***' : 'password'}@${url.hostname}${url.port ? ':' + url.port : ''}${url.pathname}`);
  
} catch (error) {
  console.log('\n❌ Failed to parse DATABASE_URL');
  console.log('   Error:', error.message);
  console.log('\n📝 Please check your DATABASE_URL format');
  console.log('   Example: postgresql://username:password@hostname:port/database_name');
  
  // Try to identify common issues
  if (databaseUrl.includes(' ')) {
    console.log('\n⚠️  Issue detected: URL contains spaces');
    console.log('   Remove any spaces from your DATABASE_URL');
  }
  
  if (databaseUrl.includes('\\n') || databaseUrl.includes('\\r')) {
    console.log('\n⚠️  Issue detected: URL contains line breaks');
    console.log('   Remove any line breaks from your DATABASE_URL');
  }
  
  if (!databaseUrl.includes('://')) {
    console.log('\n⚠️  Issue detected: Missing protocol');
    console.log('   Add protocol (e.g., postgresql://) to your DATABASE_URL');
  }
  
  if (!databaseUrl.includes('@')) {
    console.log('\n⚠️  Issue detected: Missing @ symbol');
    console.log('   Add @ symbol after username:password in your DATABASE_URL');
  }
  
  process.exit(1);
}

console.log('\n🎯 Next steps:');
console.log('   1. If all checks passed, your DATABASE_URL is ready');
console.log('   2. If warnings appeared, review and fix the issues');
console.log('   3. Deploy to Render with the corrected DATABASE_URL');
console.log('   4. Check Render logs for connection status');
