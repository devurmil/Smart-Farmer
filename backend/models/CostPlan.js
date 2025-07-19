const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CostPlan = sequelize.define('CostPlan', {
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
  farm_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'farms',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  crop_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'crops',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  crop_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  area_unit: {
    type: DataTypes.ENUM('acre', 'hectare', 'sq_meter', 'bigha'),
    allowNull: false,
    defaultValue: 'acre'
  },
  area_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  total_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  cost_breakdown: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Detailed breakdown of costs (seeds, fertilizer, labor, etc.)'
  },
  season: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Kharif, Rabi, Zaid'
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Remove defaultValue function, will set in hook
  },
  planting_month: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  harvesting_month: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  expected_yield: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Expected yield in kg'
  },
  expected_revenue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Expected revenue in INR'
  },
  expected_profit: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Expected profit (revenue - cost)'
  },
  market_price_per_kg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    comment: 'Current market price per kg'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_template: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'True if this is a template for future use'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'cost_plans',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['farm_id']
    },
    {
      fields: ['crop_id']
    },
    {
      fields: ['crop_type']
    },
    {
      fields: ['year']
    },
    {
      fields: ['season']
    },
    {
      fields: ['is_template']
    },
    {
      fields: ['created_at']
    }
  ],
  hooks: {
    beforeValidate: (costPlan) => {
      if (!costPlan.year) {
        costPlan.year = new Date().getFullYear();
      }
    }
  }
});

module.exports = CostPlan;