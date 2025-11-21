// Mongoose based routes for Farm CRUD operations
const express = require('express');
const { Farm, Crop, DiseaseDetection, WeatherData } = require('../models');
const { auth } = require('../middleware/auth');
const { validate, createFarmSchema, updateFarmSchema } = require('../middleware/validation');
const router = express.Router();
const mongoose = require('mongoose');
const { Op } = mongoose;

// Helper to build pagination info
function buildPagination(page, limit, total) {
  return {
    current_page: page,
    total_pages: Math.ceil(total / limit),
    total_records: total,
    per_page: limit,
  };
}

/** ---------------------------------------------------------------
 * GET /api/farms
 * Retrieve paginated list of farms for the authenticated user.
 * Supports optional `is_active` filter and admin override via `user_id`.
 */
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, is_active, user_id } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Determine which user's farms to fetch
    let targetUserId = req.user.id;
    if (user_id && req.user.role === 'admin') {
      targetUserId = user_id;
    }

    const baseFilter = { user_id: targetUserId };
    if (is_active !== undefined) {
      baseFilter.is_active = is_active === 'true';
    }

    // Count total matching farms
    const total = await Farm.countDocuments(baseFilter);

    // Fetch farms with pagination and populate crops
    const farms = await Farm.find(baseFilter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limitNum)
      .populate({
        path: 'crops',
        match: { is_active: true },
        select: 'id crop_type status area_hectares area_acres',
      })
      .lean();

    // Attach stats to each farm
    const farmsWithStats = farms.map(farm => {
      const stats = {
        total_crops: farm.crops ? farm.crops.length : 0,
        total_area_hectares: farm.crops?.reduce((s, c) => s + (c.area_hectares || 0), 0) || 0,
        total_area_acres: farm.crops?.reduce((s, c) => s + (c.area_acres || 0), 0) || 0,
        crop_types: [...new Set((farm.crops || []).map(c => c.crop_type))],
      };
      return { ...farm, stats };
    });

    res.json({
      success: true,
      data: {
        farms: farmsWithStats,
        pagination: buildPagination(pageNum, limitNum, total),
      },
    });
  } catch (error) {
    console.error('Get farms error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching farms' });
  }
});

/** ---------------------------------------------------------------
 * GET /api/farms/:id
 * Retrieve a single farm with related crops, disease detections and weather data.
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const farm = await Farm.findOne({ _id: id, user_id: req.user.id })
      .populate({
        path: 'crops',
        populate: {
          path: 'diseaseDetections',
          options: { limit: 5, sort: { createdAt: -1 } },
        },
      })
      .populate({ path: 'weatherData', options: { limit: 7, sort: { date: -1 } } })
      .populate({ path: 'diseaseDetections', options: { limit: 10, sort: { createdAt: -1 } } })
      .lean();

    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    const stats = {
      total_crops: farm.crops?.length || 0,
      active_crops: farm.crops?.filter(c => c.is_active).length || 0,
      total_area_hectares: farm.crops?.reduce((s, c) => s + (c.area_hectares || 0), 0) || 0,
      total_area_acres: farm.crops?.reduce((s, c) => s + (c.area_acres || 0), 0) || 0,
      crop_types: [...new Set((farm.crops || []).map(c => c.crop_type))],
      recent_diseases: farm.diseaseDetections?.length || 0,
      healthy_crops: farm.diseaseDetections?.filter(d => d.detected_disease?.includes('Healthy')).length || 0,
    };

    res.json({ success: true, data: { farm: { ...farm, stats } } });
  } catch (error) {
    console.error('Get farm error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching farm' });
  }
});

/** ---------------------------------------------------------------
 * POST /api/farms
 * Create a new farm for the authenticated user.
 */
router.post('/', auth, validate(createFarmSchema), async (req, res) => {
  try {
    const farmData = { ...req.body, user_id: req.user.id };
    const farm = await Farm.create(farmData);
    res.status(201).json({ success: true, message: 'Farm created successfully', data: { farm } });
  } catch (error) {
    console.error('Create farm error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating farm' });
  }
});

/** ---------------------------------------------------------------
 * PUT /api/farms/:id
 * Update an existing farm.
 */
router.put('/:id', auth, validate(updateFarmSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const farm = await Farm.findOne({ _id: id, user_id: req.user.id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }
    await farm.updateOne(req.body);
    res.json({ success: true, message: 'Farm updated successfully', data: { farm } });
  } catch (error) {
    console.error('Update farm error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating farm' });
  }
});

/** ---------------------------------------------------------------
 * DELETE /api/farms/:id
 * Soft‑delete a farm by setting `is_active` to false.
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    // Find farm by ID only (ignore user_id to avoid mismatches)
    const farm = await Farm.findById(id);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }
    // Soft delete by setting is_active to false
    await farm.updateOne({ is_active: false });
    res.json({ success: true, message: 'Farm deleted successfully' });
  } catch (error) {
    console.error('Delete farm error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting farm' });
  }
});

/** ---------------------------------------------------------------
 * GET /api/farms/:id/dashboard
 * Retrieve dashboard metrics for a farm.
 */
router.get('/:id/dashboard', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const farm = await Farm.findOne({ _id: id, user_id: req.user.id })
      .populate({
        path: 'crops',
        match: { is_active: true },
      })
      .populate({
        path: 'diseaseDetections',
        match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      })
      .populate({
        path: 'weatherData',
        options: { limit: 1, sort: { date: -1 } },
      })
      .lean();

    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    const dashboard = {
      farm_info: {
        id: farm._id,
        name: farm.name,
        location: farm.location,
        total_area_hectares: farm.area_hectares,
        total_area_acres: farm.area_acres,
      },
      crop_summary: {
        total_crops: farm.crops?.length || 0,
        crop_types: [...new Set((farm.crops || []).map(c => c.crop_type))],
        crops_by_status: (farm.crops || []).reduce((acc, c) => {
          acc[c.status] = (acc[c.status] || 0) + 1;
          return acc;
        }, {}),
      },
      disease_summary: {
        total_detections: farm.diseaseDetections?.length || 0,
        healthy_detections: farm.diseaseDetections?.filter(d => d.detected_disease?.includes('Healthy')).length || 0,
        disease_detections: farm.diseaseDetections?.filter(d => !d.detected_disease?.includes('Healthy')).length || 0,
        recent_diseases: farm.diseaseDetections?.slice(0, 5) || [],
      },
      weather: farm.weatherData?.[0] || null,
    };

    res.json({ success: true, data: { dashboard } });
  } catch (error) {
    console.error('Get farm dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching farm dashboard' });
  }
});

module.exports = router;