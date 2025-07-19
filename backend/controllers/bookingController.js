const { Booking } = require('../models');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { equipmentId, startDate, endDate } = req.body;
    const booking = await Booking.create({
      equipmentId,
      userId: req.user.id,
      startDate,
      endDate,
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create booking.' });
  }
};

// Get all bookings for a specific equipment
exports.getEquipmentBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({ where: { equipmentId: req.params.equipmentId } });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
};

// Get all bookings for the logged-in user
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({ where: { userId: req.user.id } });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user bookings.' });
  }
};
