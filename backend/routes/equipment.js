const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { auth: authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { uploadEquipmentImage } = require('../middleware/upload');

// Multer setup (no image format restriction)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Public: Get all available equipment
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, user_id, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    console.log('Equipment GET request - User:', req.user.id, 'Role:', req.user.role);
    console.log('Equipment GET request - Query params:', req.query);

    let whereClause = {};
    
    // Admin can fetch all equipment or for specific user
    if (req.user.role === 'admin') {
      if (user_id) {
        whereClause = { ownerId: user_id };
      }
      // If no user_id specified for admin, fetch all equipment (empty whereClause)
    } else if (req.user.role === 'owner') {
      // Owners can only see their own equipment
      whereClause = { ownerId: req.user.id };
    } else {
      // Farmers, suppliers, and all other roles see all equipment
      whereClause = {};
    }

    console.log('Equipment GET request - Where clause:', whereClause);

    const equipment = await equipmentController.getAllEquipment(offset, limit, whereClause);
    const totalCount = await equipmentController.getEquipmentCount(whereClause);

    console.log('Equipment GET request - Found equipment count:', equipment.length);
    console.log('Equipment GET request - Total count:', totalCount);

    // If date range is provided, check availability for each equipment
    let result = equipment;
    if (startDate && endDate) {
      console.log('Checking availability for date range:', startDate, 'to', endDate);
      result = await Promise.all(equipment.map(async (item) => {
        const itemData = item.toJSON();
        itemData.available = await equipmentController.isEquipmentAvailable(item.id, startDate, endDate);
        return itemData;
      }));
    } else {
      // Convert to plain objects if no date checking needed
      result = equipment.map(item => item.toJSON());
    }

    res.json({
      success: true,
      data: result,
      total: totalCount,
      page,
      limit,
    });
  } catch (error) {
    console.error('Equipment GET request error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch equipment', error: error.message });
  }
});

// Protected: Get equipment for owner
router.get('/owner', authMiddleware, equipmentController.getOwnerEquipment);

// Protected: Add equipment (with image upload)
router.post('/', authMiddleware, uploadEquipmentImage.single('image'), equipmentController.addEquipment);

// Public: Get equipment by ID
router.get('/:id', equipmentController.getEquipmentById);

// Check equipment availability for specific dates
router.get('/:id/availability', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Start date and end date are required' 
      });
    }
    
    const availability = await equipmentController.getEquipmentAvailability(id, startDate, endDate);
    
    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Equipment availability check error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check equipment availability' 
    });
  }
});

// Protected: Update equipment by ID
router.put('/:id', authMiddleware, equipmentController.updateEquipment);

// Protected: Delete equipment by ID (use controller with Mongoose)
router.delete('/:id', authMiddleware, equipmentController.deleteEquipment);

module.exports = router;
