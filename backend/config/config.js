require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const config = {
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'smart_farmer',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: process.env.DB_DIALECT || 'mysql'
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
      errors.push('DATABASE_URL is required in production');
    }
    if (!config.jwt.secret || config.jwt.secret === 'your-secret-key') {
      errors.push('JWT_SECRET must be set in production');
    }
  }

  // Check development requirements
  if (!config.server.isProduction) {
    if (!config.database.host || !config.database.name || !config.database.user) {
      errors.push('DB_HOST, DB_NAME, and DB_USER are required for local development');
    }
  }

  if (errors.length > 0) {
    console.error('❌ Configuration validation failed:');
    errors.forEach(error => console.error(`   - ${error}`));
    
    if (config.server.isProduction) {
      console.error('\n🔧 For Render deployment, set these environment variables:');
      console.error('   DATABASE_URL=your_database_connection_string');
      console.error('   JWT_SECRET=your_secure_jwt_secret');
      console.error('   NODE_ENV=production');
    } else {
      console.error('\n🔧 For local development, check your .env file:');
      console.error('   DB_HOST=localhost');
      console.error('   DB_NAME=smart_farmer');
      console.error('   DB_USER=root');
      console.error('   DB_PASSWORD=your_password');
    }
    
    process.exit(1);
  }

  console.log('✅ Configuration validation passed');
};

module.exports = { config, validateConfig }; 