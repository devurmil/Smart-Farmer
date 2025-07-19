const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Farm = sequelize.define('Farm', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Stores {lat, lng, address, city, state, country}'
  },
  area_hectares: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  area_acres: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  soil_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  irrigation_type: {
    type: DataTypes.ENUM('drip', 'sprinkler', 'flood', 'rain_fed', 'mixed'),
    allowNull: true
  },
  farm_type: {
    type: DataTypes.ENUM('organic', 'conventional', 'mixed'),
    defaultValue: 'conventional'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'farms',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = Farm;