const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Schedule maintenance
router.post('/schedule', maintenanceController.scheduleMaintenance);

// Get maintenance records for equipment owner
router.get('/records', maintenanceController.getMaintenanceRecords);

// Update maintenance status
router.put('/:id/status', maintenanceController.updateMaintenanceStatus);

// Delete maintenance record
router.delete('/:id', maintenanceController.deleteMaintenance);

module.exports = router; 