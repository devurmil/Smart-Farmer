const express = require('express');
const { User } = require('../models');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Only allow admin (by email) to access this route
router.get('/', auth, async (req, res) => {
  try {
    // Check if the logged-in user is admin
    if (req.user.email !== process.env.ADMIN_MAIL) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.'
      });
    }

    // Fetch all users (exclude password hash)
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

module.exports = router; 