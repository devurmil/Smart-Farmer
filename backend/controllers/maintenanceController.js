const { Maintenance, Equipment } = require('../models');
const mongoose = require('mongoose');

// Schedule maintenance for equipment
exports.scheduleMaintenance = async (req, res) => {
  try {
    const { equipmentId, type, scheduledDate, description } = req.body;
    
    // Validate required fields
    if (!equipmentId || !type || !scheduledDate) {
      console.log('Missing fields:', { equipmentId, type, scheduledDate });
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: equipmentId, type, scheduledDate',
        received: { equipmentId, type, scheduledDate }
      });
    }

    // Convert equipmentId to ObjectId if needed
    const equipmentObjectId = mongoose.Types.ObjectId.isValid(equipmentId) 
      ? new mongoose.Types.ObjectId(equipmentId) 
      : equipmentId;

    // Check if equipment exists
    const equipment = await Equipment.findById(equipmentObjectId);
    if (!equipment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Equipment not found' 
      });
    }

    // Check if equipment belongs to the authenticated user (owner)
    const equipmentOwnerId = equipment.ownerId.toString();
    const userId = req.user.id.toString();
    
    if (equipmentOwnerId !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'You can only schedule maintenance for your own equipment' 
      });
    }

    // Validate date is not in the past
    const maintenanceDate = new Date(scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (maintenanceDate < today) {
      return res.status(400).json({ 
        success: false, 
        error: 'Maintenance date cannot be in the past' 
      });
    }

    // Create maintenance record
    let maintenance;
    try {
      maintenance = await Maintenance.create({
        equipmentId: equipmentObjectId,
        type,
        scheduledDate: new Date(scheduledDate),
        description: description || '',
        status: 'scheduled',
        priority: type === 'emergency' ? 'urgent' : 'medium'
      });
    } catch (createError) {
      console.error('Error creating maintenance record:', createError);
      throw createError;
    }

    console.log('Maintenance scheduled:', maintenance.toObject());

    res.status(201).json({
      success: true,
      message: 'Maintenance scheduled successfully',
      data: maintenance
    });

  } catch (error) {
    console.error('Error scheduling maintenance:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to schedule maintenance',
      details: error.message
    });
  }
};

// Get maintenance records for equipment owner
exports.getMaintenanceRecords = async (req, res) => {
  try {
    const { equipmentId, status } = req.query;
    const whereClause = {};

    // If equipmentId is provided, filter by equipment
    if (equipmentId) {
      const equipmentObjectId = mongoose.Types.ObjectId.isValid(equipmentId) 
        ? new mongoose.Types.ObjectId(equipmentId) 
        : equipmentId;
      whereClause.equipmentId = equipmentObjectId;
    }

    // If status is provided, filter by status
    if (status) {
      whereClause.status = status;
    }

    // Get user's equipment IDs first
    const userId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id) 
      : req.user.id;
    
    const userEquipment = await Equipment.find({ ownerId: userId }).select('_id');
    const equipmentIds = userEquipment.map(eq => eq._id);

    // Add equipment filter to only show maintenance for user's equipment
    whereClause.equipmentId = { $in: equipmentIds };

    const maintenanceRecords = await Maintenance.find(whereClause)
      .populate('equipmentId', 'name type ownerId')
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      data: maintenanceRecords
    });

  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch maintenance records' 
    });
  }
};

// Update maintenance status
exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, cost, technician } = req.body;

    const maintenanceObjectId = mongoose.Types.ObjectId.isValid(id) 
      ? new mongoose.Types.ObjectId(id) 
      : id;

    const maintenance = await Maintenance.findById(maintenanceObjectId)
      .populate('equipmentId', 'name ownerId');

    if (!maintenance) {
      return res.status(404).json({ 
        success: false, 
        error: 'Maintenance record not found' 
      });
    }

    // Check if user owns the equipment
    const equipmentOwnerId = maintenance.equipmentId.ownerId.toString();
    const userId = req.user.id.toString();

    if (equipmentOwnerId !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'You can only update maintenance for your own equipment' 
      });
    }

    // Update maintenance record
    const updateData = { status };
    if (notes) updateData.notes = notes;
    if (cost) updateData.cost = cost;
    if (technician) updateData.technician = technician;
    
    // If status is completed, set completedDate
    if (status === 'completed') {
      updateData.completedDate = new Date();
    }

    await Maintenance.findByIdAndUpdate(maintenanceObjectId, updateData, { new: true });
    const updatedMaintenance = await Maintenance.findById(maintenanceObjectId)
      .populate('equipmentId', 'name ownerId');

    res.json({
      success: true,
      message: 'Maintenance status updated successfully',
      data: updatedMaintenance
    });

  } catch (error) {
    console.error('Error updating maintenance status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update maintenance status' 
    });
  }
};

// Update maintenance record (general update)
exports.updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, scheduledDate, description, priority, technician, cost, notes } = req.body;

    const maintenanceObjectId = mongoose.Types.ObjectId.isValid(id) 
      ? new mongoose.Types.ObjectId(id) 
      : id;

    const maintenance = await Maintenance.findById(maintenanceObjectId)
      .populate('equipmentId', 'name ownerId');

    if (!maintenance) {
      return res.status(404).json({ 
        success: false, 
        error: 'Maintenance record not found' 
      });
    }

    // Check if user owns the equipment
    const equipmentOwnerId = maintenance.equipmentId.ownerId.toString();
    const userId = req.user.id.toString();

    if (equipmentOwnerId !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'You can only update maintenance for your own equipment' 
      });
    }

    // Update maintenance record
    const updateData = {};
    if (type) updateData.type = type;
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    if (description !== undefined) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (technician !== undefined) updateData.technician = technician;
    if (cost !== undefined) updateData.cost = cost;
    if (notes !== undefined) updateData.notes = notes;

    await Maintenance.findByIdAndUpdate(maintenanceObjectId, updateData, { new: true });
    const updatedMaintenance = await Maintenance.findById(maintenanceObjectId)
      .populate('equipmentId', 'name ownerId');

    res.json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: updatedMaintenance
    });

  } catch (error) {
    console.error('Error updating maintenance record:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update maintenance record' 
    });
  }
};

// Delete maintenance record
exports.deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const maintenanceObjectId = mongoose.Types.ObjectId.isValid(id) 
      ? new mongoose.Types.ObjectId(id) 
      : id;

    const maintenance = await Maintenance.findById(maintenanceObjectId)
      .populate('equipmentId', 'name ownerId');

    if (!maintenance) {
      return res.status(404).json({ 
        success: false, 
        error: 'Maintenance record not found' 
      });
    }

    // Check if user owns the equipment
    const equipmentOwnerId = maintenance.equipmentId.ownerId.toString();
    const userId = req.user.id.toString();

    if (equipmentOwnerId !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'You can only delete maintenance for your own equipment' 
      });
    }

    await Maintenance.findByIdAndDelete(maintenanceObjectId);

    res.json({
      success: true,
      message: 'Maintenance record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete maintenance record' 
    });
  }
};
