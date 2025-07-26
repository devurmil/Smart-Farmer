const { sequelize } = require('../config/database');

async function addSocialLoginColumns() {
  try {
    console.log('Adding social login columns to users table...');
    
    // Add facebook_id column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN facebook_id VARCHAR(255) UNIQUE COMMENT 'Facebook user ID for social login'
    `);
    console.log('✓ Added facebook_id column');
    
    // Add google_id column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN google_id VARCHAR(255) UNIQUE COMMENT 'Google user ID for social login'
    `);
    console.log('✓ Added google_id column');
    
    console.log('Successfully added social login columns!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding social login columns:', error);
    process.exit(1);
  }
}

addSocialLoginColumns(); 