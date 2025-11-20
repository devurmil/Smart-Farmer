const { Booking, Equipment, User, Maintenance } = require('../models');
const mongoose = require('mongoose');

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
    
    // Convert equipmentId to ObjectId if needed
    const equipmentObjectId = mongoose.Types.ObjectId.isValid(equipmentId) 
      ? new mongoose.Types.ObjectId(equipmentId) 
      : equipmentId;
    
    // Find equipment to get ownerId
    const equipment = await Equipment.findById(equipmentObjectId);
    if (!equipment) {
      console.log('Equipment not found for ID:', equipmentId);
      return res.status(404).json({ error: 'Equipment not found.' });
    }
    
    console.log('Found equipment:', equipment.toObject());
    
    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      equipmentId: equipmentObjectId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        // Case 1: New booking starts within existing booking
        {
          startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        },
        // Case 2: New booking ends within existing booking
        {
          endDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        },
        // Case 3: New booking completely encompasses existing booking
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(endDate) }
        },
        // Case 4: New booking starts before and ends after existing booking
        {
          startDate: { $lt: new Date(startDate) },
          endDate: { $gt: new Date(endDate) }
        }
      ]
    });

    if (overlappingBooking) {
      console.log('Overlapping booking found:', overlappingBooking.toObject());
      return res.status(409).json({ 
        error: 'Equipment is already booked for the selected dates. Please choose different dates.',
        message: 'Date conflict detected'
      });
    }

    // Check for overlapping maintenance
    try {
      const overlappingMaintenance = await Maintenance.findOne({
        equipmentId: equipmentObjectId,
        status: { $in: ['scheduled', 'in-progress'] },
        scheduledDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
      });

      if (overlappingMaintenance) {
        console.log('Overlapping maintenance found:', overlappingMaintenance.toObject());
        return res.status(409).json({ 
          error: 'Equipment is scheduled for maintenance during the selected dates. Please choose different dates.',
          message: 'Maintenance conflict detected'
        });
      }
    } catch (maintenanceError) {
      console.error('Error checking maintenance conflicts:', maintenanceError);
      // Continue with booking if maintenance check fails
      console.log('Continuing with booking despite maintenance check error');
    }
    
    // Debug: Log booking data before insert
    const userId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id) 
      : req.user.id;
    const ownerId = mongoose.Types.ObjectId.isValid(equipment.ownerId) 
      ? new mongoose.Types.ObjectId(equipment.ownerId) 
      : equipment.ownerId;
    
    const bookingData = {
      equipmentId: equipmentObjectId,
      userId: userId,
      ownerId: ownerId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'pending',
    };
    console.log('Booking data to insert:', bookingData);
    
    const booking = await Booking.create(bookingData);
    console.log('Created booking:', booking.toObject());
    
    // Send real-time notification to equipment owner
    if (global.sseClients && global.sseClients.has(equipment.ownerId.toString())) {
      const ownerRes = global.sseClients.get(equipment.ownerId.toString());
      const notification = {
        type: 'new_booking',
        message: 'New booking request received',
        booking: booking.toObject(),
        equipment: equipment.toObject()
      };
      ownerRes.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
    
    // Send real-time notification to the user who made the booking
    if (global.sseClients && global.sseClients.has(req.user.id.toString())) {
      const userRes = global.sseClients.get(req.user.id.toString());
      const notification = {
        type: 'booking_created',
        message: 'Booking request sent successfully',
        booking: booking.toObject(),
        equipment: equipment.toObject()
      };
      userRes.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
    
    res.status(201).json(booking);
  } catch (err) {
    // Debug: Log the error stack and full error object
    console.error('Error creating booking:', err.stack || err);
    console.error('Full error object:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    
    // Handle specific database errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: err.errors });
    }
    
    res.status(500).json({ error: 'Failed to create booking.', details: err.message });
  }
};

// Get all bookings for a specific equipment (with user details)
exports.getEquipmentBookings = async (req, res) => {
  try {
    const equipmentObjectId = mongoose.Types.ObjectId.isValid(req.params.equipmentId) 
      ? new mongoose.Types.ObjectId(req.params.equipmentId) 
      : req.params.equipmentId;
    
    const bookings = await Booking.find({ equipmentId: equipmentObjectId })
      .populate('userId', 'name email phone');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
};

// Get all bookings for the logged-in user
exports.getUserBookings = async (req, res) => {
  try {
    console.log('getUserBookings called for user:', req.user.id);
    console.log('User object:', req.user);
    
    const userId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id) 
      : req.user.id;
    
    const bookings = await Booking.find({ userId: userId })
      .populate('equipmentId', 'name type price description')
      .sort({ createdAt: -1 });
    
    console.log('Found bookings:', bookings.length);
    console.log('Bookings data:', bookings.map(b => ({ id: b._id, status: b.status, equipmentId: b.equipmentId })));
    
    res.json(bookings);
  } catch (err) {
    console.error('Error in getUserBookings:', err);
    res.status(500).json({ error: 'Failed to fetch user bookings.' });
  }
};

// Get all bookings for the logged-in owner
exports.getOwnerBookings = async (req, res) => {
  try {
    const ownerId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id) 
      : req.user.id;
    
    const bookings = await Booking.find({ ownerId: ownerId })
      .populate('equipmentId', 'name type price description')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch owner bookings.' });
  }
};

// Approve a booking (owner only)
exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    
    const bookingOwnerId = booking.ownerId.toString();
    const userId = req.user.id.toString();
    
    if (bookingOwnerId !== userId) return res.status(403).json({ error: 'Not authorized.' });
    
    booking.status = 'approved';
    await booking.save();
    
    // Mark equipment as unavailable
    const equipment = await Equipment.findById(booking.equipmentId);
    if (equipment) {
      const hasActiveBookings = await Booking.exists({
        equipmentId: booking.equipmentId,
        status: { $in: ['approved', 'pending'] },
        _id: { $ne: booking._id }
      });
      equipment.available = !hasActiveBookings;
      await equipment.save();
    }
    
    // Send real-time notification to the user who made the booking
    if (global.sseClients && global.sseClients.has(booking.userId.toString())) {
      const userRes = global.sseClients.get(booking.userId.toString());
      const notification = {
        type: 'booking_approved',
        message: 'Your booking has been approved!',
        booking: booking.toObject(),
        equipment: equipment ? equipment.toObject() : null
      };
      userRes.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
    
    // Send real-time notification to the owner
    if (global.sseClients && global.sseClients.has(req.user.id.toString())) {
      const ownerRes = global.sseClients.get(req.user.id.toString());
      const notification = {
        type: 'booking_updated',
        message: 'Booking approved successfully',
        booking: booking.toObject(),
        equipment: equipment ? equipment.toObject() : null
      };
      ownerRes.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
    
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve booking.' });
  }
};

// Mark booking as completed (owner only)
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    
    const bookingOwnerId = booking.ownerId.toString();
    const userId = req.user.id.toString();
    
    if (bookingOwnerId !== userId) return res.status(403).json({ error: 'Not authorized.' });
    
    booking.status = 'completed';
    await booking.save();
    
    // Mark equipment as available again
    const equipment = await Equipment.findById(booking.equipmentId);
    if (equipment) {
      const hasActiveBookings = await Booking.exists({
        equipmentId: booking.equipmentId,
        status: { $in: ['approved', 'pending'] },
        _id: { $ne: booking._id }
      });
      equipment.available = !hasActiveBookings;
      await equipment.save();
    }
    
    // Send real-time notification to the user who made the booking
    if (global.sseClients && global.sseClients.has(booking.userId.toString())) {
      const userRes = global.sseClients.get(booking.userId.toString());
      const notification = {
        type: 'booking_completed',
        message: 'Your booking has been completed',
        booking: booking.toObject(),
        equipment: equipment ? equipment.toObject() : null
      };
      userRes.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
    
    // Send real-time notification to the owner
    if (global.sseClients && global.sseClients.has(req.user.id.toString())) {
      const ownerRes = global.sseClients.get(req.user.id.toString());
      const notification = {
        type: 'booking_updated',
        message: 'Booking completed successfully',
        booking: booking.toObject(),
        equipment: equipment ? equipment.toObject() : null
      };
      ownerRes.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
    
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete booking.' });
  }
};

// Decline a booking (owner only)
exports.declineBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    
    const bookingOwnerId = booking.ownerId.toString();
    const userId = req.user.id.toString();
    
    if (bookingOwnerId !== userId) return res.status(403).json({ error: 'Not authorized.' });
    
    booking.status = 'rejected';
    await booking.save();
    
    // Send real-time notification to the user who made the booking
    if (global.sseClients && global.sseClients.has(booking.userId.toString())) {
      const userRes = global.sseClients.get(booking.userId.toString());
      const notification = {
        type: 'booking_rejected',
        message: 'Your booking has been declined',
        booking: booking.toObject()
      };
      userRes.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
    
    // Send real-time notification to the owner
    if (global.sseClients && global.sseClients.has(req.user.id.toString())) {
      const ownerRes = global.sseClients.get(req.user.id.toString());
      const notification = {
        type: 'booking_updated',
        message: 'Booking declined successfully',
        booking: booking.toObject()
      };
      ownerRes.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
    
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
    
    const booking = await Booking.findById(req.params.id);
    console.log('Found booking for cancel:', booking ? booking.toObject() : 'Not found');
    
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    
    // Only allow the user who made the booking to cancel it
    const bookingUserId = booking.userId.toString();
    const currentUserId = req.user.id.toString();
    
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
    
    // Recalculate equipment availability
    const equipment = await Equipment.findById(booking.equipmentId);
    if (equipment) {
      const hasActiveBookings = await Booking.exists({
        equipmentId: booking.equipmentId,
        status: { $in: ['approved', 'pending'] }
      });
      equipment.available = !hasActiveBookings;
      await equipment.save();
    }
    
    // Send real-time notification to the equipment owner
    if (global.sseClients && global.sseClients.has(booking.ownerId.toString())) {
      const ownerRes = global.sseClients.get(booking.ownerId.toString());
      const notification = {
        type: 'booking_cancelled',
        message: 'A booking has been cancelled',
        booking: booking.toObject()
      };
      ownerRes.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
    
    // Send real-time notification to the user who cancelled
    if (global.sseClients && global.sseClients.has(req.user.id.toString())) {
      const userRes = global.sseClients.get(req.user.id.toString());
      const notification = {
        type: 'booking_updated',
        message: 'Booking cancelled successfully',
        booking: booking.toObject()
      };
      userRes.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
    
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
    
    const booking = await Booking.findById(req.params.id);
    console.log('Found booking:', booking ? booking.toObject() : 'Not found');
    
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    
    console.log('Booking owner ID:', booking.ownerId);
    console.log('Booking user ID:', booking.userId);
    console.log('Current user ID:', req.user.id);
    
    // Allow deletion if user is either the owner or the person who made the booking
    // Convert to strings to handle potential data type mismatches
    const bookingOwnerId = booking.ownerId.toString();
    const bookingUserId = booking.userId.toString();
    const currentUserId = req.user.id.toString();
    
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
    await Booking.findByIdAndDelete(req.params.id);
    console.log('Booking deleted successfully');
    
    // Recalculate equipment availability
    const equipment = await Equipment.findById(booking.equipmentId);
    if (equipment) {
      const hasActiveBookings = await Booking.exists({
        equipmentId: booking.equipmentId,
        status: { $in: ['approved', 'pending'] }
      });
      equipment.available = !hasActiveBookings;
      await equipment.save();
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({ error: 'Failed to delete booking.', details: err.message });
  }
};
