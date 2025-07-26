const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { auth: authMiddleware } = require('../middleware/auth');

// Test endpoint to check if booking system is working
router.get('/test', authMiddleware, (req, res) => {
  res.json({
    message: 'Booking system is working',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    },
    timestamp: new Date().toISOString()
  });
});

// SSE endpoint for real-time booking updates
router.get('/stream', authMiddleware, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': 'https://smart-farmer-three.vercel.app',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

  // Store the response object for later use
  const clientId = req.user.id;
  if (!global.sseClients) {
    global.sseClients = new Map();
  }
  global.sseClients.set(clientId, res);

  // Handle client disconnect
  req.on('close', () => {
    global.sseClients.delete(clientId);
  });
});

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
