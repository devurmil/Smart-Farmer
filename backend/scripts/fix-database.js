const { sequelize } = require('../config/database');

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database issues...');
    
    // Check if facebook_id column exists and add unique constraint if needed
    try {
      await sequelize.query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'users_facebook_id_unique' 
            AND table_name = 'users'
          ) THEN
            ALTER TABLE users ADD CONSTRAINT users_facebook_id_unique UNIQUE (facebook_id);
          END IF;
        END $$;
      `);
      console.log('✅ Facebook ID unique constraint added/verified');
    } catch (error) {
      console.log('⚠️ Facebook ID constraint already exists or error occurred:', error.message);
    }
    
    // Check if google_id column exists and add unique constraint if needed
    try {
      await sequelize.query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'users_google_id_unique' 
            AND table_name = 'users'
          ) THEN
            ALTER TABLE users ADD CONSTRAINT users_google_id_unique UNIQUE (google_id);
          END IF;
        END $$;
      `);
      console.log('✅ Google ID unique constraint added/verified');
    } catch (error) {
      console.log('⚠️ Google ID constraint already exists or error occurred:', error.message);
    }
    
    // Create maintenance table if it doesn't exist
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "Maintenance" (
          "id" SERIAL PRIMARY KEY,
          "equipmentId" INTEGER NOT NULL REFERENCES "Equipment"("id") ON DELETE CASCADE,
          "type" VARCHAR(255) NOT NULL CHECK ("type" IN ('routine', 'repair', 'inspection', 'upgrade', 'emergency')),
          "scheduledDate" DATE NOT NULL,
          "description" TEXT,
          "status" VARCHAR(255) DEFAULT 'scheduled' CHECK ("status" IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
          "completedDate" TIMESTAMP WITH TIME ZONE,
          "notes" TEXT,
          "cost" DECIMAL(10,2),
          "technician" VARCHAR(255),
          "priority" VARCHAR(255) DEFAULT 'medium' CHECK ("priority" IN ('low', 'medium', 'high', 'urgent')),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
        );
      `);
      console.log('✅ Maintenance table created/verified');
    } catch (error) {
      console.log('⚠️ Maintenance table already exists or error occurred:', error.message);
    }
    
    console.log('🎉 Database fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the fix if this script is executed directly
if (require.main === module) {
  fixDatabase();
}

module.exports = fixDatabase; 