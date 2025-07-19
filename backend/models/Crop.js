const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Crop = sequelize.define('Crop', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  farm_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'farms',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  crop_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  variety: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  planting_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expected_harvest_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actual_harvest_date: {
    type: DataTypes.DATE,
    allowNull: true
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
  status: {
    type: DataTypes.ENUM('planned', 'planted', 'growing', 'flowering', 'harvested', 'failed'),
    defaultValue: 'planned'
  },
  growth_stage: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  expected_yield: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Expected yield in kg/hectare'
  },
  actual_yield: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Actual yield in kg/hectare'
  },
  cost_per_hectare: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  revenue_per_hectare: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  weather_conditions: {
    type: DataTypes.JSON,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'crops',
  indexes: [
    {
      fields: ['farm_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['crop_type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['planting_date']
    }
  ]
});

module.exports = Crop;