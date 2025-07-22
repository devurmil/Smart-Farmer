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
router.get('/', equipmentController.getAllEquipment);

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
