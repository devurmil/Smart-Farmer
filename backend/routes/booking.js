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

// Get all bookings for the logged-in owner (protected)
router.get('/owner', authMiddleware, bookingController.getOwnerBookings);

// Approve a booking (owner only)
router.patch('/:id/approve', authMiddleware, bookingController.approveBooking);

// Mark booking as completed (owner only)
router.patch('/:id/complete', authMiddleware, bookingController.completeBooking);

// Decline a booking (owner only)
router.patch('/:id/decline', authMiddleware, bookingController.declineBooking);

// Cancel a booking (user who made the booking)
router.patch('/:id/cancel', authMiddleware, bookingController.cancelBooking);

// Delete a booking (owner or user who made the booking)
router.delete('/:id', authMiddleware, bookingController.deleteBooking);

module.exports = router;
