const express = require('express');
const { Crop, Farm, DiseaseDetection, CostPlan } = require('../models');
const { auth } = require('../middleware/auth');
const { validate, createCropSchema, updateCropSchema } = require('../middleware/validation');
const router = express.Router();

// @route   GET /api/crops
// @desc    Get all crops for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, farm_id, crop_type, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: req.user.id };
    if (farm_id) whereClause.farm_id = farm_id;
    if (crop_type) whereClause.crop_type = crop_type;
    if (status) whereClause.status = status;

    const { count, rows: crops } = await Crop.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Farm,
          as: 'farm',
          attributes: ['id', 'name', 'location']
        },
        {
          model: DiseaseDetection,
          as: 'diseaseDetections',
          limit: 3,
          order: [['created_at', 'DESC']],
          attributes: ['id', 'detected_disease', 'confidence_score', 'created_at']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        crops,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit)
        }
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

// @route   GET /api/crops/:id
// @desc    Get a specific crop by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const crop = await Crop.findOne({
      where: { id, user_id: req.user.id },
      include: [
        {
          model: Farm,
          as: 'farm',
          attributes: ['id', 'name', 'location', 'soil_type', 'irrigation_type']
        },
        {
          model: DiseaseDetection,
          as: 'diseaseDetections',
          order: [['created_at', 'DESC']]
        },
        {
          model: CostPlan,
          as: 'costPlans',
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Calculate crop statistics
    const cropData = crop.toJSON();
    cropData.stats = {
      total_disease_detections: cropData.diseaseDetections.length,
      healthy_detections: cropData.diseaseDetections.filter(d => d.detected_disease.includes('Healthy')).length,
      disease_detections: cropData.diseaseDetections.filter(d => !d.detected_disease.includes('Healthy')).length,
      days_since_planting: cropData.planting_date ? 
        Math.floor((new Date() - new Date(cropData.planting_date)) / (1000 * 60 * 60 * 24)) : null,
      days_to_harvest: cropData.expected_harvest_date ? 
        Math.floor((new Date(cropData.expected_harvest_date) - new Date()) / (1000 * 60 * 60 * 24)) : null,
      total_cost_plans: cropData.costPlans.length
    };

    res.json({
      success: true,
      data: { crop: cropData }
    });
  } catch (error) {
    console.error('Get crop error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching crop'
    });
  }
});

// @route   POST /api/crops
// @desc    Create a new crop
// @access  Private
router.post('/', auth, validate(createCropSchema), async (req, res) => {
  try {
    const { farm_id } = req.body;

    // Verify farm belongs to user
    const farm = await Farm.findOne({
      where: { id: farm_id, user_id: req.user.id }
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    const cropData = {
      ...req.body,
      user_id: req.user.id
    };

    const crop = await Crop.create(cropData);

    // Include farm data in response
    const cropWithFarm = await Crop.findByPk(crop.id, {
      include: [
        {
          model: Farm,
          as: 'farm',
          attributes: ['id', 'name', 'location']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Crop created successfully',
      data: { crop: cropWithFarm }
    });
  } catch (error) {
    console.error('Create crop error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating crop'
    });
  }
});

// @route   PUT /api/crops/:id
// @desc    Update a crop
// @access  Private
router.put('/:id', auth, validate(updateCropSchema), async (req, res) => {
  try {
    const { id } = req.params;

    const crop = await Crop.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    await crop.update(req.body);

    // Include farm data in response
    const updatedCrop = await Crop.findByPk(crop.id, {
      include: [
        {
          model: Farm,
          as: 'farm',
          attributes: ['id', 'name', 'location']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Crop updated successfully',
      data: { crop: updatedCrop }
    });
  } catch (error) {
    console.error('Update crop error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating crop'
    });
  }
});

// @route   DELETE /api/crops/:id
// @desc    Delete a crop
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const crop = await Crop.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Soft delete by setting is_active to false
    await crop.update({ is_active: false });

    res.json({
      success: true,
      message: 'Crop deleted successfully'
    });
  } catch (error) {
    console.error('Delete crop error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting crop'
    });
  }
});

// @route   GET /api/crops/types
// @desc    Get available crop types
// @access  Public
router.get('/types', async (req, res) => {
  try {
    // This could be from a database table or a static list
    const cropTypes = [
      'Wheat', 'Cotton', 'Groundnut', 'Rice', 'Sugarcane', 'Maize',
      'Bajra (Pearl Millet)', 'Castor', 'Potato', 'Tomato', 'Onion', 'Cumin',
      'Apple', 'Cherry', 'Corn', 'Grape', 'Orange', 'Peach', 'Pepper',
      'Rose', 'Soybean', 'Strawberry'
    ];

    res.json({
      success: true,
      data: { crop_types: cropTypes }
    });
  } catch (error) {
    console.error('Get crop types error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching crop types'
    });
  }
});

// @route   GET /api/crops/:id/timeline
// @desc    Get crop timeline/history
// @access  Private
router.get('/:id/timeline', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const crop = await Crop.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Get disease detections for timeline
    const diseaseDetections = await DiseaseDetection.findAll({
      where: { crop_id: id },
      order: [['created_at', 'ASC']],
      attributes: ['id', 'detected_disease', 'confidence_score', 'treatment_applied', 'created_at']
    });

    // Create timeline events
    const timeline = [];

    // Add planting event
    if (crop.planting_date) {
      timeline.push({
        type: 'planting',
        date: crop.planting_date,
        title: 'Crop Planted',
        description: `${crop.crop_type} planted`,
        icon: 'plant'
      });
    }

    // Add disease detection events
    diseaseDetections.forEach(detection => {
      timeline.push({
        type: 'disease_detection',
        date: detection.created_at,
        title: 'Disease Detection',
        description: `${detection.detected_disease} detected (${detection.confidence_score}% confidence)`,
        icon: detection.detected_disease.includes('Healthy') ? 'check' : 'alert',
        data: detection
      });
    });

    // Add harvest event if completed
    if (crop.actual_harvest_date) {
      timeline.push({
        type: 'harvest',
        date: crop.actual_harvest_date,
        title: 'Crop Harvested',
        description: `Harvest completed${crop.actual_yield ? ` - Yield: ${crop.actual_yield} kg/ha` : ''}`,
        icon: 'harvest'
      });
    }

    // Sort timeline by date
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: { timeline }
    });
  } catch (error) {
    console.error('Get crop timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching crop timeline'
    });
  }
});

module.exports = router;