const { sequelize } = require('../config/database');

async function addRoleSelectionColumn() {
  try {
    console.log('Adding role_selection_pending column to users table...');
    
    // Add role_selection_pending column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN role_selection_pending BOOLEAN DEFAULT FALSE COMMENT 'Indicates if user needs to select their role (for social logins)'
    `);
    console.log('✓ Added role_selection_pending column');
    
    console.log('Successfully added role selection column!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding role selection column:', error);
    process.exit(1);
  }
}

addRoleSelectionColumn(); 