const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

// User validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(255).required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  location: Joi.object({
    lat: Joi.number().optional(),
    lng: Joi.number().optional(),
    address: Joi.string().optional()
  }).optional(),
  role: Joi.string().valid('farmer', 'owner', 'supplier').required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  location: Joi.object({
    lat: Joi.number().optional(),
    lng: Joi.number().optional(),
    address: Joi.string().optional()
  }).optional()
});

// Farm validation schemas
const createFarmSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  location: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
    address: Joi.string().required(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional()
  }).required(),
  area_hectares: Joi.number().min(0).optional(),
  area_acres: Joi.number().min(0).optional(),
  soil_type: Joi.string().max(100).optional(),
  irrigation_type: Joi.string().valid('drip', 'sprinkler', 'flood', 'rain_fed', 'mixed').optional(),
  farm_type: Joi.string().valid('organic', 'conventional', 'mixed').optional(),
  description: Joi.string().optional()
});

const updateFarmSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  location: Joi.object({
    lat: Joi.number().optional(),
    lng: Joi.number().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional()
  }).optional(),
  area_hectares: Joi.number().min(0).optional(),
  area_acres: Joi.number().min(0).optional(),
  soil_type: Joi.string().max(100).optional(),
  irrigation_type: Joi.string().valid('drip', 'sprinkler', 'flood', 'rain_fed', 'mixed').optional(),
  farm_type: Joi.string().valid('organic', 'conventional', 'mixed').optional(),
  description: Joi.string().optional(),
  is_active: Joi.boolean().optional()
});

// Crop validation schemas
const createCropSchema = Joi.object({
  farm_id: Joi.string().uuid().required(),
  crop_type: Joi.string().min(1).max(100).required(),
  variety: Joi.string().max(100).optional(),
  planting_date: Joi.date().optional(),
  expected_harvest_date: Joi.date().optional(),
  area_hectares: Joi.number().min(0).optional(),
  area_acres: Joi.number().min(0).optional(),
  expected_yield: Joi.number().min(0).optional(),
  cost_per_hectare: Joi.number().min(0).optional(),
  notes: Joi.string().optional()
});

const updateCropSchema = Joi.object({
  crop_type: Joi.string().min(1).max(100).optional(),
  variety: Joi.string().max(100).optional(),
  planting_date: Joi.date().optional(),
  expected_harvest_date: Joi.date().optional(),
  actual_harvest_date: Joi.date().optional(),
  area_hectares: Joi.number().min(0).optional(),
  area_acres: Joi.number().min(0).optional(),
  status: Joi.string().valid('planned', 'planted', 'growing', 'flowering', 'harvested', 'failed').optional(),
  growth_stage: Joi.string().max(100).optional(),
  expected_yield: Joi.number().min(0).optional(),
  actual_yield: Joi.number().min(0).optional(),
  cost_per_hectare: Joi.number().min(0).optional(),
  revenue_per_hectare: Joi.number().min(0).optional(),
  notes: Joi.string().optional(),
  is_active: Joi.boolean().optional()
});

// Cost plan validation schemas
const createCostPlanSchema = Joi.object({
  farm_id: Joi.string().uuid().optional(),
  crop_id: Joi.string().uuid().optional(),
  crop_type: Joi.string().min(1).max(100).required(),
  area_unit: Joi.string().valid('acre', 'hectare', 'sq_meter', 'bigha').required(),
  area_value: Joi.number().min(0).required(),
  total_cost: Joi.number().min(0).required(),
  cost_breakdown: Joi.object().optional(),
  season: Joi.string().max(20).optional(),
  year: Joi.number().integer().min(2020).max(2050).optional(),
  planting_month: Joi.string().max(20).optional(),
  harvesting_month: Joi.string().max(20).optional(),
  expected_yield: Joi.number().min(0).optional(),
  expected_revenue: Joi.number().min(0).optional(),
  market_price_per_kg: Joi.number().min(0).optional(),
  notes: Joi.string().optional(),
  is_template: Joi.boolean().optional()
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  createFarmSchema,
  updateFarmSchema,
  createCropSchema,
  updateCropSchema,
  createCostPlanSchema
};