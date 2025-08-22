const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Load .env from root

let sequelize;

// Check if we're in production (Render deployment)
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;

console.log('🔧 Database Configuration:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   RENDER:', process.env.RENDER);
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
console.log('   DB_HOST:', process.env.DB_HOST || 'Not Set');
console.log('   DB_NAME:', process.env.DB_NAME || 'Not Set');

// Helper function to validate DATABASE_URL
const isValidDatabaseUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol && urlObj.hostname && urlObj.pathname;
  } catch (error) {
    return false;
  }
};

// Helper function to parse database URL and extract components
const parseDatabaseUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const isPostgres = urlObj.protocol === 'postgresql:' || urlObj.protocol === 'postgres:';
    
    return {
      protocol: urlObj.protocol,
      host: urlObj.hostname,
      port: urlObj.port || (isPostgres ? '5432' : '3306'),
      database: urlObj.pathname.slice(1), // Remove leading slash
      username: urlObj.username,
      password: urlObj.password,
      isPostgres
    };
  } catch (error) {
    console.error('❌ Error parsing DATABASE_URL:', error.message);
    return null;
  }
};

if (process.env.DATABASE_URL) {
  // Production: Use DATABASE_URL (Render, Heroku, etc.)
  console.log('📡 Using DATABASE_URL for production database');
  
  // Validate DATABASE_URL format
  if (!isValidDatabaseUrl(process.env.DATABASE_URL)) {
    console.error('❌ Invalid DATABASE_URL format');
    console.error('   Expected format: postgresql://username:password@host:port/database');
    console.error('   Your URL:', process.env.DATABASE_URL);
    process.exit(1);
  }
  
  // Parse the DATABASE_URL
  const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);
  if (!dbConfig) {
    console.error('❌ Failed to parse DATABASE_URL');
    process.exit(1);
  }
  
  console.log('   Parsed database config:');
  console.log('     Protocol:', dbConfig.protocol);
  console.log('     Host:', dbConfig.host);
  console.log('     Port:', dbConfig.port);
  console.log('     Database:', dbConfig.database);
  console.log('     Username:', dbConfig.username);
  console.log('     Is PostgreSQL:', dbConfig.isPostgres);
  
  try {
    // Create Sequelize instance with parsed components instead of raw URL
    sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.isPostgres ? 'postgres' : 'mysql',
        protocol: dbConfig.isPostgres ? 'postgres' : 'mysql',
        logging: false, // Disable logging in production
        dialectOptions: dbConfig.isPostgres
          ? {
              ssl: {
                require: true,
                rejectUnauthorized: false, // Needed for Supabase SSL
              },
            }
          : {},
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        define: {
          timestamps: true,
          underscored: true,
          freezeTableName: true,
        },
      }
    );
  } catch (error) {
    console.error('❌ Error creating Sequelize instance:', error.message);
    throw error;
  }
} else if (isProduction) {
  // Production but no DATABASE_URL - this is an error
  console.error('❌ CRITICAL ERROR: DATABASE_URL is required in production!');
  console.error('   Please set the DATABASE_URL environment variable in your Render dashboard.');
  console.error('   Go to: Render Dashboard > Your Service > Environment > Environment Variables');
  console.error('   Add: DATABASE_URL = your_database_connection_string');
  process.exit(1);
} else {
  // Local development (MySQL fallback)
  console.log('🏠 Using local MySQL database for development');
  
  const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables for local development:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('   Please check your .env file in the project root.');
    process.exit(1);
  }
  
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
      },
    }
  );
}

// Test database connection
const testConnection = async () => {
  try {
    console.log('🔌 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Log database info
    const config = sequelize.config;
    console.log(`   Database: ${config.database}`);
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   Dialect: ${config.dialect}`);
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    
    if (isProduction) {
      console.error('   This is a production deployment. Please check:');
      console.error('   1. DATABASE_URL environment variable is set correctly');
      console.error('   2. Database server is accessible from Render');
      console.error('   3. Database credentials are valid');
      console.error('   4. Database exists and is running');
      console.error('   5. DATABASE_URL format is correct');
      console.error('      Expected: postgresql://username:password@host:port/database');
      console.error('      Your URL:', process.env.DATABASE_URL);
    } else {
      console.error('   This is a local development environment. Please check:');
      console.error('   1. MySQL server is running');
      console.error('   2. .env file has correct database credentials');
      console.error('   3. Database exists');
    }
    
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
