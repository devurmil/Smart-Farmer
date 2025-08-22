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

if (process.env.DATABASE_URL) {
  // ✅ Production: Use Supabase DATABASE_URL with forced SSL
  console.log('📡 Using DATABASE_URL for production database');

  try {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Supabase requires this
        },
      },
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
    });
  } catch (error) {
    console.error('❌ Error creating Sequelize instance:', error.message);
    throw error;
  }
} else if (isProduction) {
  // Production but no DATABASE_URL - critical error
  console.error('❌ CRITICAL ERROR: DATABASE_URL is required in production!');
  process.exit(1);
} else {
  // 🏠 Local development (MySQL fallback)
  console.log('🏠 Using local MySQL database for development');

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
      console.error('   1. DATABASE_URL env var is correct (must include ?sslmode=require)');
      console.error('   2. Supabase allows connections');
      console.error('   3. Database credentials are valid');
    } else {
      console.error('   This is a local dev environment. Please check your .env file and MySQL setup.');
    }

    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
