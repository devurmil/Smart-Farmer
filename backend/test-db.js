const { sequelize } = require('./config/database');
const { Maintenance, Equipment } = require('./models');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test Maintenance table
    console.log('🔍 Testing Maintenance table...');
    const maintenanceCount = await Maintenance.count();
    console.log(`✅ Maintenance table accessible. Records count: ${maintenanceCount}`);
    
    // Test Equipment table
    console.log('🔍 Testing Equipment table...');
    const equipmentCount = await Equipment.count();
    console.log(`✅ Equipment table accessible. Records count: ${equipmentCount}`);
    
    // Test Maintenance model structure
    console.log('🔍 Testing Maintenance model structure...');
    const maintenanceAttributes = Maintenance.getTableName();
    console.log(`✅ Maintenance table name: ${maintenanceAttributes}`);
    
    // Test a simple query
    console.log('🔍 Testing simple query...');
    const testQuery = await Maintenance.findAll({
      limit: 1,
      include: [{
        model: Equipment,
        as: 'equipment',
        attributes: ['id', 'name']
      }]
    });
    console.log(`✅ Query successful. Found ${testQuery.length} records`);
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  } finally {
    await sequelize.close();
  }
}

testDatabase();
