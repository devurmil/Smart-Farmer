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
    const { page = 1, limit = 10, user_id } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    
    // Admin can fetch all equipment or for specific user
    if (req.user.role === 'admin') {
      if (user_id) {
        whereClause = { ownerId: user_id };
      }
      // If no user_id specified for admin, fetch all equipment (empty whereClause)
    } else {
      // Non-admin users can only see their own equipment
      whereClause = { ownerId: req.user.id };
    }

    const equipment = await equipmentController.getAllEquipment(offset, limit, whereClause);
    const totalCount = await equipmentController.getEquipmentCount(whereClause);

    res.json({
      success: true,
      data: equipment,
      total: totalCount,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch equipment', error: error.message });
  }
});

// Protected: Get equipment for owner
router.get('/owner', authMiddleware, equipmentController.getOwnerEquipment);

// Protected: Add equipment (with image upload)
router.post('/', authMiddleware, uploadEquipmentImage.single('image'), equipmentController.addEquipment);

// Public: Get equipment by ID
router.get('/:id', equipmentController.getEquipmentById);

// Protected: Update equipment by ID
router.put('/:id', authMiddleware, equipmentController.updateEquipment);

// Protected: Delete equipment by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Delete request - Equipment ID:', req.params.id);
    console.log('Delete request - User ID:', req.user.id);
    console.log('Delete request - User Email:', req.user.email);
    
    const { Equipment } = require('../models');
    const equipment = await Equipment.findByPk(req.params.id);
    console.log('Found equipment:', equipment ? equipment.toJSON() : 'Not found');
    
    if (!equipment) {
      console.log('Equipment not found in database');
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Check if the equipment belongs to the current user OR if user is admin
    const isOwner = equipment.ownerId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      console.log('Unauthorized delete attempt');
      return res.status(403).json({ error: 'Unauthorized to delete this equipment' });
    }
    
    await equipment.destroy();
    console.log('Equipment deleted successfully');
    res.json({ success: true, message: 'Equipment deleted successfully' });
  } catch (err) {
    console.error('Delete equipment error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete equipment.' });
  }
});

module.exports = router;
