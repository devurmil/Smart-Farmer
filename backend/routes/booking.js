const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { auth: authMiddleware } = require('../middleware/auth');

// Create a new booking (protected)
router.post('/', authMiddleware, bookingController.createBooking);

// Get all bookings for a specific equipment (public)
router.get('/equipment/:equipmentId', bookingController.getEquipmentBookings);

// Get all bookings for the logged-in user (protected)
router.get('/user', authMiddleware, bookingController.getUserBookings);

module.exports = router;
