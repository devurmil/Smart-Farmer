// Export all Mongoose models
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

// Note: Mongoose handles relationships through ObjectId references
// No need for explicit associations like Sequelize

module.exports = {
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
  SupplyOrder
};
