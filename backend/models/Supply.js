const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Supply = sequelize.define('Supply', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('seeds', 'fertilizers', 'pesticides', 'tools', 'machinery', 'other'),
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'piece',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 0
    }
  },
  availableQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 0
    }
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

// Hook to set availableQuantity equal to quantity when creating
Supply.beforeCreate((supply) => {
  if (!supply.availableQuantity) {
    supply.availableQuantity = supply.quantity;
  }
});

// Hook to update available flag based on availableQuantity
Supply.beforeSave((supply) => {
  supply.available = supply.availableQuantity > 0;
});

module.exports = Supply; 