const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SupplyOrder = sequelize.define('SupplyOrder', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  supplyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  buyerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Inventory tracking fields
  originalSupplyQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Quantity available in supply when order was placed'
  },
  remainingSupplyQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Remaining quantity in supply after order'
  }
});

module.exports = SupplyOrder; 