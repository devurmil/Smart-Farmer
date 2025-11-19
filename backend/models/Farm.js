const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 255
  },
  location: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  coordinates: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  area_hectares: {
    type: Number,
    default: null,
    min: 0
  },
  area_acres: {
    type: Number,
    default: null,
    min: 0
  },
  soil_type: {
    type: String,
    default: null,
    maxlength: 100
  },
  irrigation_type: {
    type: String,
    enum: ['drip', 'sprinkler', 'flood', 'rain_fed', 'mixed'],
    default: null
  },
  farm_type: {
    type: String,
    enum: ['organic', 'conventional', 'mixed'],
    default: 'conventional'
  },
  description: {
    type: String,
    default: null
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'farms'
});

// Indexes
farmSchema.index({ user_id: 1 });
farmSchema.index({ is_active: 1 });

const Farm = mongoose.model('Farm', farmSchema);

module.exports = Farm;
