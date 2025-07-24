const express = require('express');
const { Farm, Crop, DiseaseDetection, WeatherData } = require('../models');
const { auth } = require('../middleware/auth');
const { validate, createFarmSchema, updateFarmSchema } = require('../middleware/validation');
const router = express.Router();

// @route   GET /api/farms
// @desc    Get all farms for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, is_active, user_id } = req.query;
    const offset = (page - 1) * limit;

    // Admin can fetch for any user, others only for themselves
    let targetUserId = req.user.id;
    if (
      user_id &&
      req.user.role === 'admin'
    ) {
      targetUserId = user_id;
    }

    const whereClause = { user_id: targetUserId };
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    const { count, rows: farms } = await Farm.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Crop,
          as: 'crops',
          attributes: ['id', 'crop_type', 'status', 'area_hectares', 'area_acres'],
          where: { is_active: true },
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate summary statistics for each farm
    const farmsWithStats = farms.map(farm => {
      const farmData = farm.toJSON();
      farmData.stats = {
        total_crops: farmData.crops.length,
        total_area_hectares: farmData.crops.reduce((sum, crop) => sum + (crop.area_hectares || 0), 0),
        total_area_acres: farmData.crops.reduce((sum, crop) => sum + (crop.area_acres || 0), 0),
        crop_types: [...new Set(farmData.crops.map(crop => crop.crop_type))]
      };
      return farmData;
    });

    res.json({
      success: true,
      data: {
        farms: farmsWithStats,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get farms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching farms'
    });
  }
});

// @route   GET /api/farms/:id
// @desc    Get a specific farm by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const farm = await Farm.findOne({
      where: { id, user_id: req.user.id },
      include: [
        {
          model: Crop,
          as: 'crops',
          include: [
            {
              model: DiseaseDetection,
              as: 'diseaseDetections',
              limit: 5,
              order: [['created_at', 'DESC']]
            }
          ]
        },
        {
          model: WeatherData,
          as: 'weatherData',
          limit: 7,
          order: [['date', 'DESC']]
        },
        {
          model: DiseaseDetection,
          as: 'diseaseDetections',
          limit: 10,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Calculate farm statistics
    const farmData = farm.toJSON();
    farmData.stats = {
      total_crops: farmData.crops.length,
      active_crops: farmData.crops.filter(crop => crop.is_active).length,
      total_area_hectares: farmData.crops.reduce((sum, crop) => sum + (crop.area_hectares || 0), 0),
      total_area_acres: farmData.crops.reduce((sum, crop) => sum + (crop.area_acres || 0), 0),
      crop_types: [...new Set(farmData.crops.map(crop => crop.crop_type))],
      recent_diseases: farmData.diseaseDetections.length,
      healthy_crops: farmData.diseaseDetections.filter(d => d.detected_disease.includes('Healthy')).length
    };

    res.json({
      success: true,
      data: { farm: farmData }
    });
  } catch (error) {
    console.error('Get farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching farm'
    });
  }
});

// @route   POST /api/farms
// @desc    Create a new farm
// @access  Private
router.post('/', auth, validate(createFarmSchema), async (req, res) => {
  try {
    const farmData = {
      ...req.body,
      user_id: req.user.id
    };

    const farm = await Farm.create(farmData);

    res.status(201).json({
      success: true,
      message: 'Farm created successfully',
      data: { farm }
    });
  } catch (error) {
    console.error('Create farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating farm'
    });
  }
});

// @route   PUT /api/farms/:id
// @desc    Update a farm
// @access  Private
router.put('/:id', auth, validate(updateFarmSchema), async (req, res) => {
  try {
    const { id } = req.params;

    const farm = await Farm.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    await farm.update(req.body);

    res.json({
      success: true,
      message: 'Farm updated successfully',
      data: { farm }
    });
  } catch (error) {
    console.error('Update farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating farm'
    });
  }
});

// @route   DELETE /api/farms/:id
// @desc    Delete a farm
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const farm = await Farm.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Soft delete by setting is_active to false
    await farm.update({ is_active: false });

    res.json({
      success: true,
      message: 'Farm deleted successfully'
    });
  } catch (error) {
    console.error('Delete farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting farm'
    });
  }
});

// @route   GET /api/farms/:id/dashboard
// @desc    Get farm dashboard data
// @access  Private
router.get('/:id/dashboard', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const farm = await Farm.findOne({
      where: { id, user_id: req.user.id },
      include: [
        {
          model: Crop,
          as: 'crops',
          where: { is_active: true },
          required: false
        },
        {
          model: DiseaseDetection,
          as: 'diseaseDetections',
          where: {
            created_at: {
              [require('sequelize').Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          required: false
        },
        {
          model: WeatherData,
          as: 'weatherData',
          limit: 1,
          order: [['date', 'DESC']],
          required: false
        }
      ]
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    const farmData = farm.toJSON();

    // Calculate dashboard metrics
    const dashboard = {
      farm_info: {
        id: farmData.id,
        name: farmData.name,
        location: farmData.location,
        total_area_hectares: farmData.area_hectares,
        total_area_acres: farmData.area_acres
      },
      crop_summary: {
        total_crops: farmData.crops.length,
        crop_types: [...new Set(farmData.crops.map(crop => crop.crop_type))],
        crops_by_status: farmData.crops.reduce((acc, crop) => {
          acc[crop.status] = (acc[crop.status] || 0) + 1;
          return acc;
        }, {})
      },
      disease_summary: {
        total_detections: farmData.diseaseDetections.length,
        healthy_detections: farmData.diseaseDetections.filter(d => d.detected_disease.includes('Healthy')).length,
        disease_detections: farmData.diseaseDetections.filter(d => !d.detected_disease.includes('Healthy')).length,
        recent_diseases: farmData.diseaseDetections.slice(0, 5)
      },
      weather: farmData.weatherData[0] || null
    };

    res.json({
      success: true,
      data: { dashboard }
    });
  } catch (error) {
    console.error('Get farm dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching farm dashboard'
    });
  }
});

module.exports = router;