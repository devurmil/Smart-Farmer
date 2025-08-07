const { Equipment, User } = require('../models');
const { Booking, Maintenance } = require('../models');
const path = require('path');

// Helper: Check if equipment is available for a given date range
exports.isEquipmentAvailable = async function(equipmentId, startDate, endDate) {
  try {
    console.log(`Checking availability for equipment ${equipmentId} from ${startDate} to ${endDate}`);
    
    // Find any approved or pending bookings that overlap with the requested range
    const overlappingBooking = await Booking.findOne({
      where: {
        equipmentId,
        status: { [require('sequelize').Op.in]: ['approved', 'pending'] },
        [require('sequelize').Op.or]: [
          // Case 1: Booking starts within the requested range
          {
            startDate: { [require('sequelize').Op.between]: [startDate, endDate] }
          },
          // Case 2: Booking ends within the requested range
          {
            endDate: { [require('sequelize').Op.between]: [startDate, endDate] }
          },
          // Case 3: Booking completely encompasses the requested range
          {
            startDate: { [require('sequelize').Op.lte]: startDate },
            endDate: { [require('sequelize').Op.gte]: endDate }
          },
          // Case 4: Booking starts before and ends after the requested range
          {
            startDate: { [require('sequelize').Op.lt]: startDate },
            endDate: { [require('sequelize').Op.gt]: endDate }
          }
        ]
      }
    });

    // Find any scheduled maintenance that overlaps with the requested range
    const overlappingMaintenance = await Maintenance.findOne({
      where: {
        equipmentId,
        status: { [require('sequelize').Op.in]: ['scheduled', 'in_progress'] },
        scheduledDate: { [require('sequelize').Op.between]: [startDate, endDate] }
      }
    });
    
    const isAvailable = !overlappingBooking && !overlappingMaintenance;
    console.log(`Equipment ${equipmentId} availability: ${isAvailable ? 'Available' : 'Not Available'}`);
    if (overlappingBooking) console.log('Conflict: Overlapping booking found');
    if (overlappingMaintenance) console.log('Conflict: Overlapping maintenance found');
    
    return isAvailable;
  } catch (error) {
    console.error('Error checking equipment availability:', error);
    return false; // Default to unavailable if there's an error
  }
}

// Get all equipment (for route usage)
exports.getAllEquipment = async (offset = 0, limit = 10, whereClause = {}) => {
  try {
    console.log('getAllEquipment called with whereClause:', whereClause);
    console.log('getAllEquipment called with offset:', offset, 'limit:', limit);
    
    const equipment = await Equipment.findAll({
      where: whereClause,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone'] }]
    });
    
    console.log('getAllEquipment found equipment count:', equipment.length);
    if (equipment.length > 0) {
      console.log('getAllEquipment first equipment:', equipment[0].toJSON());
    }
    
    return equipment;
  } catch (err) {
    console.error('getAllEquipment error:', err);
    throw new Error('Failed to fetch equipment');
  }
};

// Get equipment count
exports.getEquipmentCount = async (whereClause = {}) => {
  try {
    const count = await Equipment.count({ where: whereClause });
    return count;
  } catch (err) {
    throw new Error('Failed to count equipment');
  }
};

// Get equipment availability for a specific date range
exports.getEquipmentAvailability = async (equipmentId, startDate, endDate) => {
  try {
    const isAvailable = await exports.isEquipmentAvailable(equipmentId, startDate, endDate);
    return {
      equipmentId,
      startDate,
      endDate,
      available: isAvailable
    };
  } catch (err) {
    console.error('Error getting equipment availability:', err);
    return {
      equipmentId,
      startDate,
      endDate,
      available: false
    };
  }
};

// Get all equipment with date-based availability (for direct route access)
exports.getAllEquipmentRoute = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const equipmentList = await Equipment.findAll();
    let result = equipmentList.map(e => e.toJSON());
    // If date range is provided, check availability for each equipment
    if (startDate && endDate) {
      result = await Promise.all(result.map(async (item) => {
        item.available = await isEquipmentAvailable(item.id, startDate, endDate);
        return item;
      }));
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch equipment.' });
  }
};

// Get equipment by owner (with pagination)
exports.getOwnerEquipment = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    // Fetch equipment with owner info
    const equipment = await Equipment.findAll({
      where: { ownerId: req.user.id },
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone'] }]
    });
    // Get total count for pagination
    const totalCount = await Equipment.count({ where: { ownerId: req.user.id } });
    res.json({
      success: true,
      data: equipment,
      total: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch owner equipment.' });
  }
};

// Add new equipment (with image upload)
exports.addEquipment = async (req, res) => {
  try {
    const { name, type, price, description, ownerId } = req.body;
    let imageUrl = null;
    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    }
    // If admin and ownerId is provided, use it; otherwise use req.user.id
    const finalOwnerId = req.user.role === 'admin' && ownerId ? ownerId : req.user.id;
    const equipment = await Equipment.create({
      name,
      type,
      price,
      description,
      imageUrl,
      ownerId: finalOwnerId,
      available: true,
    });
    res.status(201).json(equipment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add equipment.' });
  }
};

// Get equipment by ID
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) return res.status(404).json({ error: 'Not found' });
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch equipment.' });
  }
};

// Update equipment by ID
exports.updateEquipment = async (req, res) => {
  try {
    const { name, type, price, description, available, ownerId } = req.body;
    const equipment = await Equipment.findByPk(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Check if the equipment belongs to the current user or user is admin
    if (equipment.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this equipment' });
    }
    
    // Prepare update data
    const updateData = {
      name,
      type,
      price,
      description
    };
    
    // Only admin can change availability and owner
    if (req.user.role === 'admin') {
      if (available !== undefined) updateData.available = available;
      if (ownerId) updateData.ownerId = ownerId;
    }
    
    await equipment.update(updateData);
    
    res.json({ success: true, data: equipment });
  } catch (err) {
    console.error('Update equipment error:', err);
    res.status(500).json({ error: 'Failed to update equipment.' });
  }
};

// Delete equipment by ID
exports.deleteEquipment = async (req, res) => {
  try {
    console.log('Delete request - Equipment ID:', req.params.id);
    console.log('Delete request - User ID:', req.user.id);
    
    const equipment = await Equipment.findByPk(req.params.id);
    console.log('Found equipment:', equipment ? equipment.toJSON() : 'Not found');
    
    if (!equipment) {
      console.log('Equipment not found in database');
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Check if the equipment belongs to the current user OR if user is admin
    console.log('Equipment owner ID:', equipment.ownerId);
    console.log('Current user ID:', req.user.id);
    console.log('User role:', req.user.role);
    console.log('Owner match:', equipment.ownerId === req.user.id);
    console.log('Is admin:', req.user.role === 'admin');
    
    const isOwner = equipment.ownerId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      console.log('Unauthorized delete attempt - not owner or admin');
      return res.status(403).json({ error: 'Unauthorized to delete this equipment' });
    }
    
    await equipment.destroy();
    console.log('Equipment deleted successfully');
    res.json({ message: 'Equipment deleted successfully' });
  } catch (err) {
    console.error('Delete equipment error:', err);
    res.status(500).json({ error: 'Failed to delete equipment.' });
  }
};
