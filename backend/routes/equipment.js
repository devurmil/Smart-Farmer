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

    // Admin can fetch for any user, others only for themselves
    let targetUserId = req.user.id;
    if (
      user_id &&
      req.user.email === process.env.ADMIN_MAIL
    ) {
      targetUserId = user_id;
    }

    const whereClause = { user_id: targetUserId };
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
router.delete('/:id', authMiddleware, equipmentController.deleteEquipment);

module.exports = router;
