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
console.log('# For local development:');
console.log('DB_HOST=localhost');
console.log('DB_PORT=3306');
console.log('DB_NAME=smart_farmer');
console.log('DB_USER=root');
console.log('DB_PASSWORD=your_mysql_password');
console.log('DB_DIALECT=mysql\n');

console.log('# For production (Render, Heroku, etc.):');
console.log('# DATABASE_URL=postgresql://username:password@host:port/database_name');
console.log('# Example: DATABASE_URL=postgresql://smartfarmer_user:pass123@dpg-abc123-a.oregon-postgres.render.com/smartfarmer_db\n');

console.log('# JWT Configuration');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('JWT_EXPIRES_IN=7d\n');

console.log('# Server Configuration');
console.log('NODE_ENV=development');
console.log('PORT=5000');
console.log('HOST=0.0.0.0\n');

console.log('# CORS Configuration');
console.log('CORS_ORIGIN=http://localhost:3000\n');

console.log('# Optional: Cloudinary (for image uploads)');
console.log('# CLOUDINARY_CLOUD_NAME=your_cloud_name');
console.log('# CLOUDINARY_API_KEY=your_api_key');
console.log('# CLOUDINARY_API_SECRET=your_api_secret\n');

console.log('# ==========================================');
console.log('# Render Deployment Specific');
console.log('# ==========================================');
console.log('# Set these in Render dashboard Environment Variables:\n');

console.log('# Required for production:');
console.log('DATABASE_URL=your_database_connection_string');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('NODE_ENV=production\n');

console.log('# Optional:');
console.log('CORS_ORIGIN=https://your-frontend-domain.com\n');

console.log('🎯 Next Steps:');
console.log('1. Copy the variables above to your .env file');
console.log('2. For Render deployment, set DATABASE_URL and JWT_SECRET in dashboard');
console.log('3. Create a PostgreSQL database in Render');
console.log('4. Deploy your backend service');
console.log('5. Test the connection\n');

console.log('📚 See RENDER_DEPLOYMENT_GUIDE.md for detailed instructions');
