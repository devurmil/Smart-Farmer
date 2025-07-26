const express = require('express');
const { User } = require('../models');
const { auth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { Equipment, Supply } = require('../models');

// Only allow admin (by role) to access this route
const isAdmin = (req) => req.user.role === 'admin';

// GET all users
router.get('/', auth, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }
    const users = await User.findAll({ attributes: { exclude: ['password'] }, order: [['created_at', 'DESC']] });
    // For each user, add equipmentCount and supplyCount
    const usersWithDetails = await Promise.all(users.map(async user => {
      const equipment = await Equipment.findAll({ where: { ownerId: user.id } });
      const supplies = await Supply.findAll({ where: { supplierId: user.id } });
      return { ...user.toJSON(), equipment, supplies };
    }));
    res.json({ success: true, data: { users: usersWithDetails } });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching users' });
  }
});

// DELETE user
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting user' });
  }
});

// UPDATE user
router.put('/:id', auth, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { name, email, phone, password, role } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    // Only update password if a non-empty password is provided
    // The User model's beforeUpdate hook will handle the hashing automatically
    if (password && password.trim() !== '') {
      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password must be at least 6 characters long' 
        });
      }
      user.password = password;
    }
    await user.save();
    const updatedUser = user.toJSON();
    delete updatedUser.password;
    res.json({ success: true, message: 'User updated successfully', data: { user: updatedUser } });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating user' });
  }
});

// CREATE user
router.post('/', auth, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required' });
    }
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }
    // The User model's beforeCreate hook will handle the password hashing automatically
    const newUser = await User.create({ name, email, phone, password, role });
    const userObj = newUser.toJSON();
    delete userObj.password;
    res.status(201).json({ success: true, message: 'User created successfully', data: { user: userObj } });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating user' });
  }
});

module.exports = router; 