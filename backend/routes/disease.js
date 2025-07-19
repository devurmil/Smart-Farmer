const express = require('express');
const { DiseaseDetection, Crop, Farm } = require('../models');
const { auth } = require('../middleware/auth');
const { uploadDiseaseImage, handleUploadError } = require('../middleware/upload');
const router = express.Router();

// Disease tips and treatment recommendations (from your frontend)
const DISEASE_TIPS = {
  // Apple diseases
  'Scab-Apple': {
    severity: 'Moderate',
    treatment: 'Apply fungicides like Captan or Mancozeb. Remove fallen leaves and prune infected branches.',
    prevention: 'Plant resistant varieties, maintain good air circulation, and avoid overhead irrigation.',
    pesticide: 'Captan 50WP (2-3 applications at 10-14 day intervals)'
  },
  'Blackrot-Apple': {
    severity: 'High',
    treatment: 'Remove and destroy infected fruit and branches. Apply copper-based fungicides.',
    prevention: 'Prune regularly, remove mummified fruit, and maintain tree health.',
    pesticide: 'Copper hydroxide (Kocide 3000) or Captan 50WP'
  },
  'Cedar_Rust-Apple': {
    severity: 'Moderate',
    treatment: 'Remove nearby cedar trees if possible. Apply fungicides during bloom period.',
    prevention: 'Plant resistant varieties and maintain distance from cedar trees.',
    pesticide: 'Myclobutanil (Rally 40WSP) or Propiconazole (Banner Maxx)'
  },
  'Healthy-Apple': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular pruning, fertilization, and pest monitoring.',
    pesticide: 'No treatment needed'
  },
  // Add more diseases as needed...
  'Healthy': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular pruning, fertilization, and pest monitoring.',
    pesticide: 'No treatment needed'
  }
};

// @route   POST /api/disease/detect
// @desc    Detect disease from uploaded image
// @access  Private
router.post('/detect', auth, uploadDiseaseImage.single('image'), handleUploadError, async (req, res) => {
  try {
    const { crop_type, farm_id, crop_id, location, weather_conditions } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    if (!crop_type) {
      return res.status(400).json({
        success: false,
        message: 'Crop type is required'
      });
    }

    // For now, we'll simulate disease detection
    // In a real implementation, you would call your ML model here
    const mockDetection = simulateMLDetection(crop_type);

    // Get disease tips
    const diseaseTips = DISEASE_TIPS[mockDetection.detected_disease] || {
      severity: 'Unknown',
      treatment: 'Please consult with a local agricultural expert.',
      prevention: 'Maintain good cultural practices and regular monitoring.',
      pesticide: 'Consult with local agricultural extension for recommendations.'
    };

    // Save detection to database
    const detection = await DiseaseDetection.create({
      user_id: req.user.id,
      crop_id: crop_id || null,
      farm_id: farm_id || null,
      crop_type,
      image_url: req.file.path,
      image_public_id: req.file.filename,
      detected_disease: mockDetection.detected_disease,
      confidence_score: mockDetection.confidence_score,
      severity_level: diseaseTips.severity,
      treatment_recommended: diseaseTips.treatment,
      pesticide_recommended: diseaseTips.pesticide,
      prevention_tips: diseaseTips.prevention,
      location: location ? JSON.parse(location) : null,
      weather_conditions: weather_conditions ? JSON.parse(weather_conditions) : null
    });

    res.json({
      success: true,
      message: 'Disease detection completed',
      data: {
        detection: {
          id: detection.id,
          detected_disease: detection.detected_disease,
          confidence_score: detection.confidence_score,
          severity_level: detection.severity_level,
          treatment_recommended: detection.treatment_recommended,
          pesticide_recommended: detection.pesticide_recommended,
          prevention_tips: detection.prevention_tips,
          image_url: detection.image_url,
          created_at: detection.created_at
        }
      }
    });
  } catch (error) {
    console.error('Disease detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during disease detection'
    });
  }
});

// @route   GET /api/disease/history
// @desc    Get user's disease detection history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, crop_type, farm_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: req.user.id };
    if (crop_type) whereClause.crop_type = crop_type;
    if (farm_id) whereClause.farm_id = farm_id;

    const { count, rows: detections } = await DiseaseDetection.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Crop,
          as: 'crop',
          attributes: ['id', 'crop_type', 'variety', 'status']
        },
        {
          model: Farm,
          as: 'farm',
          attributes: ['id', 'name', 'location']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        detections,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get detection history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching detection history'
    });
  }
});

// @route   GET /api/disease/treatments/:disease
// @desc    Get treatment information for a specific disease
// @access  Public
router.get('/treatments/:disease', async (req, res) => {
  try {
    const { disease } = req.params;
    
    const diseaseTips = DISEASE_TIPS[disease];
    if (!diseaseTips) {
      return res.status(404).json({
        success: false,
        message: 'Treatment information not found for this disease'
      });
    }

    res.json({
      success: true,
      data: {
        disease,
        ...diseaseTips
      }
    });
  } catch (error) {
    console.error('Get treatment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching treatment information'
    });
  }
});

// @route   PUT /api/disease/:id/treatment
// @desc    Update treatment status
// @access  Private
router.put('/:id/treatment', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { treatment_applied, treatment_date, treatment_notes, follow_up_required, follow_up_date } = req.body;

    const detection = await DiseaseDetection.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Disease detection record not found'
      });
    }

    await detection.update({
      treatment_applied: treatment_applied !== undefined ? treatment_applied : detection.treatment_applied,
      treatment_date: treatment_date || detection.treatment_date,
      treatment_notes: treatment_notes || detection.treatment_notes,
      follow_up_required: follow_up_required !== undefined ? follow_up_required : detection.follow_up_required,
      follow_up_date: follow_up_date || detection.follow_up_date
    });

    res.json({
      success: true,
      message: 'Treatment status updated successfully',
      data: { detection }
    });
  } catch (error) {
    console.error('Update treatment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating treatment status'
    });
  }
});

// Helper function to simulate ML detection
function simulateMLDetection(cropType) {
  // This is a mock function. In real implementation, you would:
  // 1. Load the appropriate ML model for the crop type
  // 2. Process the uploaded image
  // 3. Run inference and get predictions
  
  const mockDiseases = {
    'apple': ['Scab-Apple', 'Blackrot-Apple', 'Cedar_Rust-Apple', 'Healthy-Apple'],
    'tomato': ['Bacterial_spot-Tomato', 'Healthy-Tomato', 'Leaf_Mold-Tomato', 'Septoria_leaf_spot-Tomato'],
    'potato': ['Early_blight-Potato', 'Healthy-Potato', 'Late_blight-Potato'],
    'corn': ['Cercospora_leaf_spot-Corn', 'Common_rust-Corn', 'Healthy-Corn', 'Northern_leaf_blight-Corn']
  };

  const diseases = mockDiseases[cropType.toLowerCase()] || ['Healthy'];
  const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
  const confidence = Math.random() * 40 + 60; // Random confidence between 60-100%

  return {
    detected_disease: randomDisease,
    confidence_score: parseFloat(confidence.toFixed(2))
  };
}

module.exports = router;