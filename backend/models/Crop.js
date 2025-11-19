const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farm_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crop_type: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  variety: {
    type: String,
    default: null,
    maxlength: 100
  },
  planting_date: {
    type: Date,
    default: null
  },
  expected_harvest_date: {
    type: Date,
    default: null
  },
  actual_harvest_date: {
    type: Date,
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
  status: {
    type: String,
    enum: ['planned', 'planted', 'growing', 'flowering', 'harvested', 'failed'],
    default: 'planned'
  },
  growth_stage: {
    type: String,
    default: null,
    maxlength: 100
  },
  expected_yield: {
    type: Number,
    default: null,
    min: 0
  },
  actual_yield: {
    type: Number,
    default: null,
    min: 0
  },
  cost_per_hectare: {
    type: Number,
    default: null,
    min: 0
  },
  revenue_per_hectare: {
    type: Number,
    default: null,
    min: 0
  },
  notes: {
    type: String,
    default: null
  },
  weather_conditions: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'crops'
});

// Indexes
cropSchema.index({ farm_id: 1 });
cropSchema.index({ user_id: 1 });
cropSchema.index({ crop_type: 1 });
cropSchema.index({ status: 1 });
cropSchema.index({ planting_date: 1 });

const Crop = mongoose.model('Crop', cropSchema);

module.exports = Crop;
