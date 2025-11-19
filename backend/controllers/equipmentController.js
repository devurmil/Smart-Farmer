const { Equipment, User } = require('../models');
const { Booking, Maintenance } = require('../models');
const mongoose = require('mongoose');
const path = require('path');

// Helper: Check if equipment is available for a given date range
exports.isEquipmentAvailable = async function(equipmentId, startDate, endDate) {
  try {
    console.log(`Checking availability for equipment ${equipmentId} from ${startDate} to ${endDate}`);
    
    // Convert to ObjectId if it's a string
    const equipmentObjectId = mongoose.Types.ObjectId.isValid(equipmentId) 
      ? new mongoose.Types.ObjectId(equipmentId) 
      : equipmentId;
    
    // Find any approved or pending bookings that overlap with the requested range
    const overlappingBooking = await Booking.findOne({
      equipmentId: equipmentObjectId,
      status: { $in: ['approved', 'pending'] },
      $or: [
        // Case 1: Booking starts within the requested range
        {
          startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        },
        // Case 2: Booking ends within the requested range
        {
          endDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        },
        // Case 3: Booking completely encompasses the requested range
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(endDate) }
        },
        // Case 4: Booking starts before and ends after the requested range
        {
          startDate: { $lt: new Date(startDate) },
          endDate: { $gt: new Date(endDate) }
        }
      ]
    });

    // Find any scheduled maintenance that overlaps with the requested range
    let overlappingMaintenance = null;
    try {
      overlappingMaintenance = await Maintenance.findOne({
        equipmentId: equipmentObjectId,
        status: { $in: ['scheduled', 'in-progress'] },
        scheduledDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
      });
    } catch (maintenanceError) {
      console.error('Error checking maintenance conflicts:', maintenanceError);
      // Continue without maintenance check if it fails
    }
    
    const isAvailable = !overlappingBooking && !overlappingMaintenance;
    console.log(`Equipment ${equipmentId} availability: ${isAvailable ? 'Available' : 'Not Available'}`);
    if (overlappingBooking) console.log('Conflict: Overlapping booking found');
    if (overlappingMaintenance) console.log('Conflict: Overlapping maintenance found');
    
    return isAvailable;
  } catch (error) {
    console.error('Error checking equipment availability:', error);
    return false; // Default to unavailable if there's an error
  }
};

// Get all equipment (for route usage)
exports.getAllEquipment = async (offset = 0, limit = 10, whereClause = {}) => {
  try {
    console.log('getAllEquipment called with whereClause:', whereClause);
    console.log('getAllEquipment called with offset:', offset, 'limit:', limit);
    
    const equipment = await Equipment.find(whereClause)
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    
    console.log('getAllEquipment found equipment count:', equipment.length);
    if (equipment.length > 0) {
      console.log('getAllEquipment first equipment:', equipment[0]);
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
    const count = await Equipment.countDocuments(whereClause);
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
    const equipmentList = await Equipment.find();
    let result = equipmentList.map(e => e.toObject());
    // If date range is provided, check availability for each equipment
    if (startDate && endDate) {
      result = await Promise.all(result.map(async (item) => {
        item.available = await exports.isEquipmentAvailable(item._id.toString(), startDate, endDate);
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
    
    // Convert user ID to ObjectId if needed
    const userId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id) 
      : req.user.id;
    
    // Fetch equipment with owner info
    const equipment = await Equipment.find({ ownerId: userId })
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalCount = await Equipment.countDocuments({ ownerId: userId });
    
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
    
    // Convert to ObjectId if needed
    const ownerObjectId = mongoose.Types.ObjectId.isValid(finalOwnerId) 
      ? new mongoose.Types.ObjectId(finalOwnerId) 
      : finalOwnerId;
    
    const equipment = await Equipment.create({
      name,
      type,
      price,
      description,
      imageUrl,
      ownerId: ownerObjectId,
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
    const equipment = await Equipment.findById(req.params.id);
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
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Check if the equipment belongs to the current user or user is admin
    const equipmentOwnerId = equipment.ownerId.toString();
    const userId = req.user.id.toString();
    
    if (equipmentOwnerId !== userId && req.user.role !== 'admin') {
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
      if (ownerId) {
        updateData.ownerId = mongoose.Types.ObjectId.isValid(ownerId) 
          ? new mongoose.Types.ObjectId(ownerId) 
          : ownerId;
      }
    }
    
    await Equipment.findByIdAndUpdate(req.params.id, updateData, { new: true });
    const updatedEquipment = await Equipment.findById(req.params.id);
    
    res.json({ success: true, data: updatedEquipment });
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
    
    const equipment = await Equipment.findById(req.params.id);
    console.log('Found equipment:', equipment ? equipment.toObject() : 'Not found');
    
    if (!equipment) {
      console.log('Equipment not found in database');
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Check if the equipment belongs to the current user OR if user is admin
    const equipmentOwnerId = equipment.ownerId.toString();
    const userId = req.user.id.toString();
    
    console.log('Equipment owner ID:', equipmentOwnerId);
    console.log('Current user ID:', userId);
    console.log('User role:', req.user.role);
    console.log('Owner match:', equipmentOwnerId === userId);
    console.log('Is admin:', req.user.role === 'admin');
    
    const isOwner = equipmentOwnerId === userId;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      console.log('Unauthorized delete attempt - not owner or admin');
      return res.status(403).json({ error: 'Unauthorized to delete this equipment' });
    }
    
    await Equipment.findByIdAndDelete(req.params.id);
    console.log('Equipment deleted successfully');
    res.json({ message: 'Equipment deleted successfully' });
  } catch (err) {
    console.error('Delete equipment error:', err);
    res.status(500).json({ error: 'Failed to delete equipment.' });
  }
};
