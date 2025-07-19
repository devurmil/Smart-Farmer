const express = require('express');
const { CostPlan, Farm, Crop } = require('../models');
const { auth } = require('../middleware/auth');
const { validate, createCostPlanSchema } = require('../middleware/validation');
const router = express.Router();

// Crop data from your frontend (Gujarat crop costs)
const CROP_DATA = [
  {
    name: "Wheat",
    planting_months: "November - December",
    water_timing: "Every 10-12 days",
    fertilizers: "NPK 120:60:40 kg/ha",
    soil_preparation: "Well-ploughed, leveled, weed-free",
    harvesting_time: "March - April",
    cost: { acre: 12000, hectare: 30000, sq_meter: 3, bigha: 7500 }
  },
  {
    name: "Cotton",
    planting_months: "June - July",
    water_timing: "Every 7-10 days",
    fertilizers: "NPK 150:75:75 kg/ha",
    soil_preparation: "Deep ploughing, fine tilth",
    harvesting_time: "October - January",
    cost: { acre: 18000, hectare: 45000, sq_meter: 4.5, bigha: 11250 }
  },
  {
    name: "Groundnut",
    planting_months: "June - July",
    water_timing: "Every 8-10 days",
    fertilizers: "NPK 20:40:0 kg/ha",
    soil_preparation: "Sandy loam, well-drained",
    harvesting_time: "September - October",
    cost: { acre: 15000, hectare: 37500, sq_meter: 3.75, bigha: 9375 }
  },
  {
    name: "Rice",
    planting_months: "June - July",
    water_timing: "Continuous flooding",
    fertilizers: "NPK 100:50:50 kg/ha",
    soil_preparation: "Puddled, leveled",
    harvesting_time: "October - November",
    cost: { acre: 16000, hectare: 40000, sq_meter: 4, bigha: 10000 }
  },
  {
    name: "Sugarcane",
    planting_months: "December - February",
    water_timing: "Every 7-12 days",
    fertilizers: "NPK 250:115:115 kg/ha",
    soil_preparation: "Deep ploughing, ridges",
    harvesting_time: "December - March",
    cost: { acre: 35000, hectare: 87500, sq_meter: 8.75, bigha: 21875 }
  },
  {
    name: "Maize",
    planting_months: "June - July",
    water_timing: "Every 7-10 days",
    fertilizers: "NPK 120:60:40 kg/ha",
    soil_preparation: "Well-tilled, weed-free",
    harvesting_time: "September - October",
    cost: { acre: 13000, hectare: 32500, sq_meter: 3.25, bigha: 8125 }
  },
  {
    name: "Bajra (Pearl Millet)",
    planting_months: "June - July",
    water_timing: "Every 10-15 days",
    fertilizers: "NPK 60:40:20 kg/ha",
    soil_preparation: "Light, sandy loam",
    harvesting_time: "September - October",
    cost: { acre: 9000, hectare: 22500, sq_meter: 2.25, bigha: 5625 }
  },
  {
    name: "Castor",
    planting_months: "July - August",
    water_timing: "Every 12-15 days",
    fertilizers: "NPK 80:40:40 kg/ha",
    soil_preparation: "Well-drained, sandy loam",
    harvesting_time: "December - January",
    cost: { acre: 11000, hectare: 27500, sq_meter: 2.75, bigha: 6875 }
  },
  {
    name: "Potato",
    planting_months: "October - November",
    water_timing: "Every 7-10 days",
    fertilizers: "NPK 150:100:100 kg/ha",
    soil_preparation: "Loose, friable, well-drained",
    harvesting_time: "January - February",
    cost: { acre: 25000, hectare: 62500, sq_meter: 6.25, bigha: 15625 }
  },
  {
    name: "Tomato",
    planting_months: "June - July, October - November",
    water_timing: "Every 5-7 days",
    fertilizers: "NPK 100:50:50 kg/ha",
    soil_preparation: "Well-tilled, organic matter",
    harvesting_time: "September - February",
    cost: { acre: 22000, hectare: 55000, sq_meter: 5.5, bigha: 13750 }
  },
  {
    name: "Onion",
    planting_months: "October - November",
    water_timing: "Every 7-10 days",
    fertilizers: "NPK 100:50:50 kg/ha",
    soil_preparation: "Loose, well-drained",
    harvesting_time: "January - March",
    cost: { acre: 20000, hectare: 50000, sq_meter: 5, bigha: 12500 }
  },
  {
    name: "Cumin",
    planting_months: "November - December",
    water_timing: "Every 10-15 days",
    fertilizers: "NPK 60:30:20 kg/ha",
    soil_preparation: "Sandy loam, well-drained",
    harvesting_time: "February - March",
    cost: { acre: 17000, hectare: 42500, sq_meter: 4.25, bigha: 10625 }
  }
];

// @route   GET /api/cost-planning/crops
// @desc    Get all available crops with cost information
// @access  Public
router.get('/crops', async (req, res) => {
  try {
    const { unit = 'acre', search } = req.query;

    let crops = CROP_DATA;

    // Filter by search term if provided
    if (search) {
      crops = crops.filter(crop => 
        crop.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Format response with selected unit
    const formattedCrops = crops.map(crop => ({
      ...crop,
      cost_per_unit: crop.cost[unit] || crop.cost.acre,
      unit: unit
    }));

    res.json({
      success: true,
      data: {
        crops: formattedCrops,
        available_units: ['acre', 'hectare', 'sq_meter', 'bigha'],
        total_crops: formattedCrops.length
      }
    });
  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching crops'
    });
  }
});

// @route   POST /api/cost-planning/calculate
// @desc    Calculate cost for a specific crop and area
// @access  Private
router.post('/calculate', auth, validate(createCostPlanSchema), async (req, res) => {
  try {
    const { crop_type, area_unit, area_value, farm_id, crop_id } = req.body;

    // Find crop data
    const cropData = CROP_DATA.find(crop => 
      crop.name.toLowerCase() === crop_type.toLowerCase()
    );

    if (!cropData) {
      return res.status(404).json({
        success: false,
        message: 'Crop type not found'
      });
    }

    // Calculate costs
    const costPerUnit = cropData.cost[area_unit] || cropData.cost.acre;
    const totalCost = costPerUnit * area_value;

    // Create detailed cost breakdown
    const costBreakdown = {
      seeds: Math.round(totalCost * 0.15), // 15% for seeds
      fertilizers: Math.round(totalCost * 0.25), // 25% for fertilizers
      pesticides: Math.round(totalCost * 0.10), // 10% for pesticides
      labor: Math.round(totalCost * 0.30), // 30% for labor
      irrigation: Math.round(totalCost * 0.10), // 10% for irrigation
      equipment: Math.round(totalCost * 0.05), // 5% for equipment
      miscellaneous: Math.round(totalCost * 0.05) // 5% for miscellaneous
    };

    // Adjust for any rounding differences
    const calculatedTotal = Object.values(costBreakdown).reduce((sum, cost) => sum + cost, 0);
    if (calculatedTotal !== totalCost) {
      costBreakdown.miscellaneous += (totalCost - calculatedTotal);
    }

    // Estimate yield and revenue (these are rough estimates)
    const yieldEstimates = {
      'Wheat': 3000, 'Cotton': 1500, 'Rice': 4000, 'Sugarcane': 70000,
      'Maize': 3500, 'Groundnut': 2000, 'Potato': 25000, 'Tomato': 30000
    };

    const marketPrices = {
      'Wheat': 25, 'Cotton': 60, 'Rice': 20, 'Sugarcane': 3,
      'Maize': 22, 'Groundnut': 50, 'Potato': 15, 'Tomato': 20
    };

    const expectedYieldPerUnit = yieldEstimates[crop_type] || 2000;
    const marketPricePerKg = marketPrices[crop_type] || 25;
    const expectedYield = expectedYieldPerUnit * area_value;
    const expectedRevenue = expectedYield * marketPricePerKg;
    const expectedProfit = expectedRevenue - totalCost;

    // Save cost plan to database
    const costPlan = await CostPlan.create({
      user_id: req.user.id,
      farm_id: farm_id || null,
      crop_id: crop_id || null,
      crop_type,
      area_unit,
      area_value,
      total_cost: totalCost,
      cost_breakdown: costBreakdown,
      expected_yield: expectedYield,
      expected_revenue: expectedRevenue,
      expected_profit: expectedProfit,
      market_price_per_kg: marketPricePerKg,
      planting_month: cropData.planting_months,
      harvesting_month: cropData.harvesting_time
    });

    res.json({
      success: true,
      message: 'Cost calculation completed',
      data: {
        cost_plan: costPlan,
        crop_info: {
          name: cropData.name,
          planting_months: cropData.planting_months,
          harvesting_time: cropData.harvesting_time,
          water_timing: cropData.water_timing,
          fertilizers: cropData.fertilizers,
          soil_preparation: cropData.soil_preparation
        },
        calculation_summary: {
          area: `${area_value} ${area_unit}`,
          cost_per_unit: costPerUnit,
          total_cost: totalCost,
          expected_yield: `${expectedYield} kg`,
          expected_revenue: expectedRevenue,
          expected_profit: expectedProfit,
          profit_margin: expectedRevenue > 0 ? ((expectedProfit / expectedRevenue) * 100).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    console.error('Calculate cost error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during cost calculation'
    });
  }
});

// @route   GET /api/cost-planning/history
// @desc    Get user's cost planning history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, crop_type, farm_id, year } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: req.user.id };
    if (crop_type) whereClause.crop_type = crop_type;
    if (farm_id) whereClause.farm_id = farm_id;
    if (year) whereClause.year = year;

    const { count, rows: costPlans } = await CostPlan.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Farm,
          as: 'farm',
          attributes: ['id', 'name', 'location']
        },
        {
          model: Crop,
          as: 'crop',
          attributes: ['id', 'crop_type', 'variety', 'status']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate summary statistics
    const totalInvestment = costPlans.reduce((sum, plan) => sum + parseFloat(plan.total_cost), 0);
    const totalExpectedRevenue = costPlans.reduce((sum, plan) => sum + parseFloat(plan.expected_revenue || 0), 0);
    const totalExpectedProfit = costPlans.reduce((sum, plan) => sum + parseFloat(plan.expected_profit || 0), 0);

    res.json({
      success: true,
      data: {
        cost_plans: costPlans,
        summary: {
          total_plans: count,
          total_investment: totalInvestment,
          total_expected_revenue: totalExpectedRevenue,
          total_expected_profit: totalExpectedProfit,
          average_profit_margin: totalExpectedRevenue > 0 ? 
            ((totalExpectedProfit / totalExpectedRevenue) * 100).toFixed(2) : 0
        },
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get cost planning history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cost planning history'
    });
  }
});

// @route   GET /api/cost-planning/:id
// @desc    Get specific cost plan details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const costPlan = await CostPlan.findOne({
      where: { id, user_id: req.user.id },
      include: [
        {
          model: Farm,
          as: 'farm',
          attributes: ['id', 'name', 'location', 'area_hectares', 'area_acres']
        },
        {
          model: Crop,
          as: 'crop',
          attributes: ['id', 'crop_type', 'variety', 'status', 'planting_date', 'expected_harvest_date']
        }
      ]
    });

    if (!costPlan) {
      return res.status(404).json({
        success: false,
        message: 'Cost plan not found'
      });
    }

    res.json({
      success: true,
      data: { cost_plan: costPlan }
    });
  } catch (error) {
    console.error('Get cost plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cost plan'
    });
  }
});

// @route   DELETE /api/cost-planning/:id
// @desc    Delete a cost plan
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const costPlan = await CostPlan.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!costPlan) {
      return res.status(404).json({
        success: false,
        message: 'Cost plan not found'
      });
    }

    await costPlan.destroy();

    res.json({
      success: true,
      message: 'Cost plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete cost plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting cost plan'
    });
  }
});

module.exports = router;