const { Maintenance, Equipment } = require('../models');

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

    // Check if equipment exists
    const equipment = await Equipment.findByPk(equipmentId);
    if (!equipment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Equipment not found' 
      });
    }

    // Check if equipment belongs to the authenticated user (owner)
    if (equipment.ownerId !== req.user.id) {
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
        equipmentId,
        type,
        scheduledDate,
        description: description || '',
        status: 'scheduled',
        priority: type === 'emergency' ? 'urgent' : 'medium'
      });
    } catch (createError) {
      console.error('Error creating maintenance record:', createError);
      // Check if it's a table doesn't exist error
      if (createError.name === 'SequelizeDatabaseError' && createError.message.includes('relation "Maintenance" does not exist')) {
        return res.status(500).json({
          success: false,
          error: 'Maintenance table not found. Please contact administrator.'
        });
      }
      throw createError;
    }

    console.log('Maintenance scheduled:', maintenance.toJSON());

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
      whereClause.equipmentId = equipmentId;
    }

    // If status is provided, filter by status
    if (status) {
      whereClause.status = status;
    }

    const maintenanceRecords = await Maintenance.findAll({
      where: whereClause,
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'type', 'ownerId'],
          where: { ownerId: req.user.id } // Only show maintenance for user's equipment
        }
      ],
      order: [['scheduledDate', 'ASC']]
    });

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

    const maintenance = await Maintenance.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'ownerId']
        }
      ]
    });

    if (!maintenance) {
      return res.status(404).json({ 
        success: false, 
        error: 'Maintenance record not found' 
      });
    }

    // Check if user owns the equipment
    if (maintenance.equipment.ownerId !== req.user.id) {
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

    await maintenance.update(updateData);

    res.json({
      success: true,
      message: 'Maintenance status updated successfully',
      data: maintenance
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

    const maintenance = await Maintenance.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'ownerId']
        }
      ]
    });

    if (!maintenance) {
      return res.status(404).json({ 
        success: false, 
        error: 'Maintenance record not found' 
      });
    }

    // Check if user owns the equipment
    if (maintenance.equipment.ownerId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'You can only update maintenance for your own equipment' 
      });
    }

    // Update maintenance record
    const updateData = {};
    if (type) updateData.type = type;
    if (scheduledDate) updateData.scheduledDate = scheduledDate;
    if (description !== undefined) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (technician !== undefined) updateData.technician = technician;
    if (cost !== undefined) updateData.cost = cost;
    if (notes !== undefined) updateData.notes = notes;

    await maintenance.update(updateData);

    res.json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: maintenance
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

    const maintenance = await Maintenance.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'ownerId']
        }
      ]
    });

    if (!maintenance) {
      return res.status(404).json({ 
        success: false, 
        error: 'Maintenance record not found' 
      });
    }

    // Check if user owns the equipment
    if (maintenance.equipment.ownerId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'You can only delete maintenance for your own equipment' 
      });
    }

    await maintenance.destroy();

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