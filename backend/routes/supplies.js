console.log("Supplies route loaded");
const express = require('express');
const multer = require('multer');
const path = require('path');
const { Supply, SupplyOrder, User } = require('../models');
const { auth } = require('../middleware/auth');
const { uploadSupplyImage } = require('../middleware/upload');
const router = express.Router();

// @route   GET /api/supplies
// @desc    Get all available supplies
// @access  Public
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, user_id } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    
    // Admin can fetch all supplies or for specific user
    if (req.user.role === 'admin') {
      if (user_id) {
        whereClause = { supplierId: user_id };
      }
      // If no user_id specified for admin, fetch all supplies (empty whereClause)
    } else {
      // Non-admin users can only see their own supplies
      whereClause = { supplierId: req.user.id };
    }

    const supplies = await Supply.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'supplier',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: supplies,
      total: supplies.length,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching supplies:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/supplies
// @desc    Add a new supply (suppliers only)
// @access  Private
router.post('/', auth, uploadSupplyImage.single('image'), async (req, res) => {
  try {
    // Check if user is a supplier
    if (req.user.role !== 'supplier') {
      return res.status(403).json({ message: 'Only suppliers can add supplies' });
    }

    const {
      name,
      category,
      price,
      unit,
      quantity,
      description,
      brand,
      expiryDate,
      location
    } = req.body;

    const supplyData = {
      name,
      category,
      price: parseFloat(price),
      unit,
      quantity: parseInt(quantity),
      description,
      brand,
      supplierId: req.user.id,
      available: true
    };

    if (expiryDate) {
      supplyData.expiryDate = new Date(expiryDate);
    }

    if (location) {
      supplyData.location = JSON.parse(location);
    }

    if (req.file && req.file.path) {
      supplyData.imageUrl = req.file.path;
    }

    const supply = await Supply.create(supplyData);

    res.status(201).json({
      success: true,
      message: 'Supply added successfully',
      data: supply
    });
  } catch (error) {
    console.error('Error adding supply:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/supplies/my-supplies
// @desc    Get supplies added by the logged-in supplier
// @access  Private
router.get('/my-supplies', auth, async (req, res) => {
  try {
    if (req.user.role !== 'supplier') {
      return res.status(403).json({ message: 'Only suppliers can view their supplies' });
    }

    const supplies = await Supply.findAll({
      where: { supplierId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json(supplies);
  } catch (error) {
    console.error('Error fetching my supplies:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/supplies/:id
// @desc    Update a supply
// @access  Private
router.put('/:id', auth, uploadSupplyImage.single('image'), async (req, res) => {
  try {
    const supply = await Supply.findByPk(req.params.id);
    
    if (!supply) {
      return res.status(404).json({ message: 'Supply not found' });
    }

    if (supply.supplierId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this supply' });
    }

    const updateData = { ...req.body };
    
    if (req.file && req.file.path) {
      updateData.imageUrl = req.file.path;
    }

    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }

    if (updateData.quantity) {
      updateData.quantity = parseInt(updateData.quantity);
    }

    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }

    if (updateData.location) {
      updateData.location = JSON.parse(updateData.location);
    }

    await supply.update(updateData);

    res.json({
      success: true,
      message: 'Supply updated successfully',
      data: supply
    });
  } catch (error) {
    console.error('Error updating supply:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/supplies/:id
// @desc    Delete a supply
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const supply = await Supply.findByPk(req.params.id);
    
    if (!supply) {
      return res.status(404).json({ success: false, message: 'Supply not found' });
    }

    // Check if the supply belongs to the current user OR if user is admin
    const isOwner = supply.supplierId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this supply' });
    }

    await supply.destroy();

    res.json({
      success: true,
      message: 'Supply deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting supply:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/supplies/:id/order
// @desc    Place an order for a supply
// @access  Private
router.post('/:id/order', auth, async (req, res) => {
  try {
    const supply = await Supply.findByPk(req.params.id);
    
    if (!supply) {
      return res.status(404).json({ message: 'Supply not found' });
    }

    if (!supply.available) {
      return res.status(400).json({ message: 'Supply is not available' });
    }

    const { quantity, deliveryAddress, contactPhone, notes } = req.body;
    const orderQuantity = parseInt(quantity) || 1;
    const totalPrice = supply.price * orderQuantity;

    const order = await SupplyOrder.create({
      supplyId: supply.id,
      buyerId: req.user.id,
      supplierId: supply.supplierId,
      quantity: orderQuantity,
      totalPrice,
      deliveryAddress,
      contactPhone,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/supplies/orders
// @desc    Get orders for the logged-in user
// @access  Private
router.get('/orders', auth, async (req, res) => {
  try {
    let orders;
    
    if (req.user.role === 'supplier') {
      // Get orders where user is the supplier
      orders = await SupplyOrder.findAll({
        where: { supplierId: req.user.id },
        include: [
          {
            model: Supply,
            as: 'supply',
            attributes: ['id', 'name', 'category', 'price', 'unit']
          },
          {
            model: User,
            as: 'buyer',
            attributes: ['id', 'name', 'email', 'phone']
          }
        ],
        order: [['orderDate', 'DESC']]
      });
    } else {
      // Get orders where user is the buyer
      orders = await SupplyOrder.findAll({
        where: { buyerId: req.user.id },
        include: [
          {
            model: Supply,
            as: 'supply',
            attributes: ['id', 'name', 'category', 'price', 'unit']
          },
          {
            model: User,
            as: 'seller',
            attributes: ['id', 'name', 'email', 'phone']
          }
        ],
        order: [['orderDate', 'DESC']]
      });
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/supplies/orders/:id/status
// @desc    Update order status (suppliers only)
// @access  Private
router.put('/orders/:id/status', auth, async (req, res) => {
  try {
    const order = await SupplyOrder.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.supplierId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await order.update({ status });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/suppliers
// @desc    Get all suppliers (name, email, phone)
// @access  Public
router.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await User.findAll({
      where: { role: 'supplier' },
      attributes: ['id', 'name', 'email', 'phone']
    });
    res.json({ success: true, data: suppliers });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

module.exports = router; 