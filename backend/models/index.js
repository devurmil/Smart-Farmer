const { sequelize } = require('../config/database');
const User = require('./User');
const Farm = require('./Farm');
const Crop = require('./Crop');
const DiseaseDetection = require('./DiseaseDetection');
const WeatherData = require('./WeatherData');
const CostPlan = require('./CostPlan');
const Equipment = require('./Equipment');
const Booking = require('./Booking');
const Maintenance = require('./Maintenance');
const Supply = require('./Supply');
const SupplyOrder = require('./SupplyOrder');

// Define associations
User.hasMany(Farm, { foreignKey: 'user_id', as: 'farms' });
Farm.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Crop, { foreignKey: 'user_id', as: 'crops' });
Crop.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Farm.hasMany(Crop, { foreignKey: 'farm_id', as: 'crops' });
Crop.belongsTo(Farm, { foreignKey: 'farm_id', as: 'farm' });

User.hasMany(DiseaseDetection, { foreignKey: 'user_id', as: 'diseaseDetections' });
DiseaseDetection.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Farm.hasMany(DiseaseDetection, { foreignKey: 'farm_id', as: 'diseaseDetections' });
DiseaseDetection.belongsTo(Farm, { foreignKey: 'farm_id', as: 'farm' });

Crop.hasMany(DiseaseDetection, { foreignKey: 'crop_id', as: 'diseaseDetections' });
DiseaseDetection.belongsTo(Crop, { foreignKey: 'crop_id', as: 'crop' });

Farm.hasMany(WeatherData, { foreignKey: 'farm_id', as: 'weatherData' });
WeatherData.belongsTo(Farm, { foreignKey: 'farm_id', as: 'farm' });

User.hasMany(CostPlan, { foreignKey: 'user_id', as: 'costPlans' });
CostPlan.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Farm.hasMany(CostPlan, { foreignKey: 'farm_id', as: 'costPlans' });
CostPlan.belongsTo(Farm, { foreignKey: 'farm_id', as: 'farm' });

Crop.hasMany(CostPlan, { foreignKey: 'crop_id', as: 'costPlans' });
CostPlan.belongsTo(Crop, { foreignKey: 'crop_id', as: 'crop' });

// Equipment rental associations
User.hasMany(Equipment, { foreignKey: 'ownerId', as: 'equipment' });
Equipment.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Equipment.hasMany(Booking, { foreignKey: 'equipmentId', as: 'bookings' });
Booking.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });

Equipment.hasMany(Maintenance, { foreignKey: 'equipmentId', as: 'maintenance' });
Maintenance.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Supply associations
User.hasMany(Supply, { foreignKey: 'supplierId', as: 'supplies' });
Supply.belongsTo(User, { foreignKey: 'supplierId', as: 'supplier' });

Supply.hasMany(SupplyOrder, { foreignKey: 'supplyId', as: 'orders' });
SupplyOrder.belongsTo(Supply, { foreignKey: 'supplyId', as: 'supply' });

User.hasMany(SupplyOrder, { foreignKey: 'buyerId', as: 'purchases' });
SupplyOrder.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

User.hasMany(SupplyOrder, { foreignKey: 'supplierId', as: 'sales' });
SupplyOrder.belongsTo(User, { foreignKey: 'supplierId', as: 'seller' });

// Sync database
const syncDatabase = async (force = false) => {
  try {
    if (force) {
      await sequelize.sync({ force });
      console.log('✅ Database synchronized successfully (force mode).');
    } else {
      // Use alter: true to add new columns without dropping tables
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized successfully (alter mode).');
    }
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Farm,
  Crop,
  DiseaseDetection,
  WeatherData,
  CostPlan,
  Equipment,
  Booking,
  Maintenance,
  Supply,
  SupplyOrder,
  syncDatabase
};