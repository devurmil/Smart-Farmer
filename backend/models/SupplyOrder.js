const mongoose = require('mongoose');

const supplyOrderSchema = new mongoose.Schema({
  supplyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supply',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  deliveryAddress: {
    type: String,
    default: null
  },
  contactPhone: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  originalSupplyQuantity: {
    type: Number,
    required: true
  },
  remainingSupplyQuantity: {
    type: Number,
    required: true
  }
}, {
  timestamps: true,
  collection: 'supply_orders'
});

// Indexes
supplyOrderSchema.index({ supplyId: 1 });
supplyOrderSchema.index({ buyerId: 1 });
supplyOrderSchema.index({ supplierId: 1 });
supplyOrderSchema.index({ status: 1 });
supplyOrderSchema.index({ orderDate: 1 });

const SupplyOrder = mongoose.model('SupplyOrder', supplyOrderSchema);

module.exports = SupplyOrder;
