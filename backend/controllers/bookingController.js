const { Booking, Equipment, User } = require('../models');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { equipmentId, startDate, endDate } = req.body;
    
    // Validate required fields
    if (!equipmentId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields: equipmentId, startDate, endDate' });
    }
    
    // Validate dates
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    const bookingStartDate = new Date(startDate);
    const bookingEndDate = new Date(endDate);
    
    // Check if dates are valid
    if (isNaN(bookingStartDate.getTime()) || isNaN(bookingEndDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    // Check if start date is in the past
    if (bookingStartDate < today) {
      return res.status(400).json({ error: 'Start date cannot be in the past' });
    }
    
    // Check if end date is in the past
    if (bookingEndDate < today) {
      return res.status(400).json({ error: 'End date cannot be in the past' });
    }
    
    // Check if end date is before or same as start date
    if (bookingEndDate <= bookingStartDate) {
      return res.status(400).json({ error: 'End date must be after start date (minimum 1 day rental)' });
    }
    
    // Debug: Log incoming request body and user
    console.log('Booking request body:', req.body);
    console.log('Authenticated user:', req.user);
    console.log('Date validation passed - Start:', startDate, 'End:', endDate);
    
    // Find equipment to get ownerId
    const equipment = await Equipment.findByPk(equipmentId);
    if (!equipment) {
      console.log('Equipment not found for ID:', equipmentId);
      return res.status(404).json({ error: 'Equipment not found.' });
    }
    
    console.log('Found equipment:', equipment.toJSON());
    
    // Debug: Log booking data before insert
    const bookingData = {
      equipmentId: equipmentId,
      userId: req.user.id,
      ownerId: equipment.ownerId,
      startDate,
      endDate,
      status: 'pending',
    };
    console.log('Booking data to insert:', bookingData);
    
    const booking = await Booking.create(bookingData);
    console.log('Created booking:', booking.toJSON());
    
    // Notification to owner (for now, just log)
    console.log(`NOTIFICATION: Equipment owner ${equipment.ownerId} - New booking request for equipment ${equipmentId}`);
    res.status(201).json(booking);
  } catch (err) {
    // Debug: Log the error stack and full error object
    console.error('Error creating booking:', err.stack || err);
    console.error('Full error object:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    
    // Handle specific database errors
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: err.errors });
    }
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Invalid reference to equipment or user', details: err.message });
    }
    if (err.name === 'SequelizeConnectionError') {
      return res.status(500).json({ error: 'Database connection error', details: err.message });
    }
    
    res.status(500).json({ error: 'Failed to create booking.', details: err.message });
  }
};

// Get all bookings for a specific equipment (with user details)
exports.getEquipmentBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { equipmentId: req.params.equipmentId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }]
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
};

// Get all bookings for the logged-in user
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [{ model: Equipment, as: 'equipment', attributes: ['id', 'name', 'type', 'price', 'description'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user bookings.' });
  }
};

// Get all bookings for the logged-in owner
exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({ where: { ownerId: req.user.id } });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch owner bookings.' });
  }
};

// Approve a booking (owner only)
exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.ownerId !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });
    booking.status = 'approved';
    await booking.save();
    // Mark equipment as unavailable
    const equipment = await Equipment.findByPk(booking.equipmentId);
    if (equipment) {
      equipment.available = false;
      await equipment.save();
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve booking.' });
  }
};

// Mark booking as completed (owner only)
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.ownerId !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });
    booking.status = 'completed';
    await booking.save();
    // Mark equipment as available again
    const equipment = await Equipment.findByPk(booking.equipmentId);
    if (equipment) {
      equipment.available = true;
      await equipment.save();
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete booking.' });
  }
};

// Decline a booking (owner only)
exports.declineBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.ownerId !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });
    booking.status = 'rejected';
    await booking.save();
    res.json({ message: 'Booking declined', booking });
  } catch (err) {
    res.status(500).json({ error: 'Failed to decline booking.' });
  }
};

// Cancel a booking (user who made the booking only)
exports.cancelBooking = async (req, res) => {
  try {
    console.log('Cancel booking request - Booking ID:', req.params.id);
    console.log('Cancel booking request - User ID:', req.user.id);
    
    const booking = await Booking.findByPk(req.params.id);
    console.log('Found booking for cancel:', booking ? booking.toJSON() : 'Not found');
    
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    
    // Only allow the user who made the booking to cancel it
    const bookingUserId = String(booking.userId);
    const currentUserId = String(req.user.id);
    
    console.log('Cancel authorization check:');
    console.log('- Booking user ID (string):', bookingUserId);
    console.log('- Current user ID (string):', currentUserId);
    console.log('- Is booking user?', bookingUserId === currentUserId);
    
    if (bookingUserId !== currentUserId) {
      console.log('Cancel authorization failed - not the booking user');
      return res.status(403).json({ error: 'You can only cancel your own bookings.' });
    }
    
    // Only allow cancellation of pending or approved bookings
    if (booking.status === 'completed' || booking.status === 'rejected') {
      return res.status(400).json({ error: 'Cannot cancel completed or rejected bookings.' });
    }
    
    console.log('Authorization passed, cancelling booking...');
    booking.status = 'cancelled';
    await booking.save();
    console.log('Booking cancelled successfully');
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Failed to cancel booking.', details: err.message });
  }
};

// Delete a booking (owner or user who made the booking)
exports.deleteBooking = async (req, res) => {
  try {
    console.log('Delete booking request - Booking ID:', req.params.id);
    console.log('Delete booking request - User ID:', req.user.id);
    
    const booking = await Booking.findByPk(req.params.id);
    console.log('Found booking:', booking ? booking.toJSON() : 'Not found');
    
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    
    console.log('Booking owner ID:', booking.ownerId);
    console.log('Booking user ID:', booking.userId);
    console.log('Current user ID:', req.user.id);
    
    // Allow deletion if user is either the owner or the person who made the booking
    // Convert to strings to handle potential data type mismatches
    const bookingOwnerId = String(booking.ownerId);
    const bookingUserId = String(booking.userId);
    const currentUserId = String(req.user.id);
    
    console.log('Authorization check:');
    console.log('- Booking owner ID (string):', bookingOwnerId);
    console.log('- Booking user ID (string):', bookingUserId);
    console.log('- Current user ID (string):', currentUserId);
    console.log('- Is owner?', bookingOwnerId === currentUserId);
    console.log('- Is booking user?', bookingUserId === currentUserId);
    
    if (bookingOwnerId !== currentUserId && bookingUserId !== currentUserId) {
      console.log('Authorization failed - user not authorized');
      return res.status(403).json({ error: 'Not authorized to delete this booking.' });
    }
    
    console.log('Authorization passed, deleting booking...');
    await booking.destroy();
    console.log('Booking deleted successfully');
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({ error: 'Failed to delete booking.', details: err.message });
  }
};
