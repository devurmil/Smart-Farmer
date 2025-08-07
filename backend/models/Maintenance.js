const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Maintenance = sequelize.define('Maintenance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  equipmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Equipment',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  type: {
    type: DataTypes.ENUM('routine', 'repair', 'inspection', 'upgrade', 'emergency'),
    allowNull: false,
  },
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'scheduled',
  },
  completedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  technician: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['equipmentId']
    },
    {
      fields: ['scheduledDate']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Maintenance; 