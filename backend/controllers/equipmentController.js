const { Equipment } = require('../models');
const path = require('path');

// Get all available equipment
exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findAll({ where: { available: true } });
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch equipment.' });
  }
};

// Get equipment by owner
exports.getOwnerEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findAll({ where: { ownerId: req.user.id } });
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch owner equipment.' });
  }
};

// Add new equipment (with image upload)
exports.addEquipment = async (req, res) => {
  try {
    const { name, type, price, description } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    const equipment = await Equipment.create({
      name,
      type,
      price,
      description,
      imageUrl,
      ownerId: req.user.id,
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
    const { name, type, price, description } = req.body;
    const equipment = await Equipment.findByPk(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Check if the equipment belongs to the current user
    if (equipment.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this equipment' });
    }
    
    await equipment.update({
      name,
      type,
      price,
      description
    });
    
    res.json(equipment);
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
    
    // Check if the equipment belongs to the current user
    console.log('Equipment owner ID:', equipment.ownerId);
    console.log('Current user ID:', req.user.id);
    console.log('Owner match:', equipment.ownerId === req.user.id);
    
    if (equipment.ownerId !== req.user.id) {
      console.log('Unauthorized delete attempt');
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
