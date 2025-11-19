#!/usr/bin/env node

/**
 * Generate example environment variables for Smart Farmer deployment
 * Run this script to get a template for your .env file
 */

const crypto = require('crypto');

console.log('🔧 Smart Farmer Environment Variables Generator\n');

// Generate a secure JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('📝 Copy these variables to your .env file or Render environment:\n');

console.log('# ==========================================');
console.log('# Smart Farmer Backend Environment Variables');
console.log('# ==========================================\n');

console.log('# Database Configuration');
console.log('# Local development (MongoDB):');
console.log('MONGO_URL=mongodb://localhost:27017/smart_farmer');
console.log('# Production / MongoDB Atlas:');
console.log('# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/smart_farmer');
console.log('# DATABASE_URL can be used instead of MONGO_URL if preferred\n');

console.log('# JWT Configuration');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('JWT_EXPIRES_IN=7d\n');

console.log('# Server Configuration');
console.log('NODE_ENV=development');
console.log('PORT=5000');
console.log('HOST=0.0.0.0\n');

console.log('# Gmail API (OTP + transactional email via Gmail API)');
console.log('GOOGLE_EMAIL=your_gmail_address@gmail.com');
console.log('GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com');
console.log('GOOGLE_CLIENT_SECRET=your_google_client_secret');
console.log('GOOGLE_REFRESH_TOKEN=your_google_refresh_token');
console.log('GOOGLE_REDIRECT_URI=https://developers.google.com/oauthplayground');
console.log('USE_GMAIL_API=true');
console.log('# Or set GOOGLE_TOKEN_FILE=./token.json if you store the refresh token on disk\n');

console.log('# Optional: Cloudinary (for image uploads)');
console.log('# CLOUDINARY_CLOUD_NAME=your_cloud_name');
console.log('# CLOUDINARY_API_KEY=your_api_key');
console.log('# CLOUDINARY_API_SECRET=your_api_secret\n');

console.log('# ==========================================');
console.log('# Render Deployment Specific');
console.log('# ==========================================');
console.log('# Set these in Render dashboard Environment Variables:\n');

console.log('# Required for production:');
console.log('MONGO_URL=your_mongodb_connection_string');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('NODE_ENV=production\n');

console.log('# Optional:');
console.log('CORS_ORIGIN=https://your-frontend-domain.com\n');

console.log('🎯 Next Steps:');
console.log('1. Copy the variables above to your .env file');
console.log('2. Provision a MongoDB database (MongoDB Atlas or self-hosted)');
console.log('3. Set MONGO_URL and JWT_SECRET in your hosting provider (Render) dashboard');
console.log('4. Deploy your backend service');
console.log('5. Run `node test-database-connection.cjs` to verify connectivity\n');

console.log('📚 See RENDER_DEPLOYMENT_GUIDE.md and MONGODB_MIGRATION_GUIDE.md for detailed instructions');
