const mongoose = require('mongoose');

const costPlanSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farm_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    default: null
  },
  crop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    default: null
  },
  crop_type: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  area_unit: {
    type: String,
    enum: ['acre', 'hectare', 'sq_meter', 'bigha'],
    default: 'acre',
    required: true
  },
  area_value: {
    type: Number,
    required: true,
    min: 0
  },
  total_cost: {
    type: Number,
    required: true,
    min: 0
  },
  cost_breakdown: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  season: {
    type: String,
    default: null,
    maxlength: 20
  },
  year: {
    type: Number,
    required: true
  },
  planting_month: {
    type: String,
    default: null,
    maxlength: 20
  },
  harvesting_month: {
    type: String,
    default: null,
    maxlength: 20
  },
  expected_yield: {
    type: Number,
    default: null,
    min: 0
  },
  expected_revenue: {
    type: Number,
    default: null,
    min: 0
  },
  expected_profit: {
    type: Number,
    default: null
  },
  market_price_per_kg: {
    type: Number,
    default: null,
    min: 0
  },
  notes: {
    type: String,
    default: null
  },
  is_template: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'cost_plans'
});

// Pre-validate hook to set year if not provided
costPlanSchema.pre('validate', function(next) {
  if (!this.year) {
    this.year = new Date().getFullYear();
  }
  next();
});

// Indexes
costPlanSchema.index({ user_id: 1 });
costPlanSchema.index({ farm_id: 1 });
costPlanSchema.index({ crop_id: 1 });
costPlanSchema.index({ crop_type: 1 });
costPlanSchema.index({ year: 1 });
costPlanSchema.index({ season: 1 });
costPlanSchema.index({ is_template: 1 });
costPlanSchema.index({ createdAt: 1 });

const CostPlan = mongoose.model('CostPlan', costPlanSchema);

module.exports = CostPlan;
