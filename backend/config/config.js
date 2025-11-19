require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const mongoUrl = process.env.MONGO_URL || process.env.DATABASE_URL;

const config = {
  database: {
    url: mongoUrl,
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production' || !!process.env.RENDER
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Cloudinary Configuration (if using)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }
};

// Validation
const validateConfig = () => {
  const errors = [];

  // Check production requirements
  if (config.server.isProduction) {
    if (!config.database.url) {
      errors.push('MONGO_URL (or DATABASE_URL) is required in production');
    }
    if (!config.jwt.secret || config.jwt.secret === 'your-secret-key') {
      errors.push('JWT_SECRET must be set in production');
    }
  }

  // Check development requirements
  if (!config.server.isProduction) {
    if (!config.database.url) {
      errors.push('Set MONGO_URL for local development (e.g., mongodb://localhost:27017/smart_farmer)');
    }
  }

  if (errors.length > 0) {
    console.error('❌ Configuration validation failed:');
    errors.forEach(error => console.error(`   - ${error}`));
    
    const guidance = config.server.isProduction
      ? [
          '\n🔧 For Render deployment, set these environment variables:',
          '   MONGO_URL=your_mongodb_connection_string',
          '   JWT_SECRET=your_secure_jwt_secret',
          '   NODE_ENV=production',
        ]
      : [
          '\n🔧 For local development, add to your .env file:',
          '   MONGO_URL=mongodb://localhost:27017/smart_farmer',
          '   JWT_SECRET=your_secure_jwt_secret',
        ];

    guidance.forEach((line) => console.error(line));
    
    process.exit(1);
  }

  console.log('✅ Configuration validation passed');
};

module.exports = { config, validateConfig }; 