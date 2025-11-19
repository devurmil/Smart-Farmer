const mongoose = require('mongoose');

const supplySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['seeds', 'fertilizers', 'pesticides', 'tools', 'machinery', 'other'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'piece'
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 0
  },
  availableQuantity: {
    type: Number,
    required: true,
    default: 1,
    min: 0
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  brand: {
    type: String,
    default: null
  },
  expiryDate: {
    type: Date,
    default: null
  },
  available: {
    type: Boolean,
    default: true
  },
  location: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true,
  collection: 'supplies'
});

// Pre-save hook to set availableQuantity equal to quantity when creating
supplySchema.pre('save', function(next) {
  if (this.isNew && !this.availableQuantity) {
    this.availableQuantity = this.quantity;
  }
  // Update available flag based on availableQuantity
  this.available = this.availableQuantity > 0;
  next();
});

// Indexes
supplySchema.index({ supplierId: 1 });
supplySchema.index({ category: 1 });
supplySchema.index({ available: 1 });

const Supply = mongoose.model('Supply', supplySchema);

module.exports = Supply;
