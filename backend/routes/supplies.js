console.log("Supplies route loaded");
const express = require('express');
const multer = require('multer');
const path = require('path');
const { Supply, SupplyOrder, User } = require('../models');
const { auth } = require('../middleware/auth');
const { uploadSupplyImage } = require('../middleware/upload');
const supplyController = require('../controllers/supplyController');
const InventoryService = require('../services/inventoryService');
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
    } else if (req.user.role === 'supplier') {
      // Suppliers can only see their own supplies
      whereClause = { supplierId: req.user.id };
    } else {
      // Farmers and other roles see all supplies
      whereClause = {};
    }

    const supplies = await Supply.find(whereClause)
      .populate('supplierId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(offset);

    const total = await Supply.countDocuments(whereClause);
    
    res.json({
      success: true,
      data: supplies,
      total,
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
    // Allow admin or supplier to add supplies
    if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only suppliers or admin can add supplies' });
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
      location,
      supplierId
    } = req.body;

    const supplyData = {
      name,
      category,
      price: parseFloat(price),
      unit,
      quantity: parseInt(quantity),
      availableQuantity: parseInt(quantity), // Set initial available quantity
      description,
      brand,
      supplierId: req.user.role === 'admin' && supplierId ? supplierId : req.user.id,
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

    const supplies = await Supply.find({ supplierId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(supplies);
  } catch (error) {
    console.error('Error fetching my supplies:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/supplies/inventory-summary
// @desc    Get inventory summary for supplier
// @access  Private
router.get('/inventory-summary', auth, async (req, res) => {
  try {
    if (req.user.role !== 'supplier') {
      return res.status(403).json({ message: 'Only suppliers can view inventory summary' });
    }

    const summary = await InventoryService.getInventorySummary(req.user.id);
    
    if (summary.error) {
      return res.status(500).json({ message: summary.error });
    }

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update supply by ID (admin or owner)
router.put('/:id', auth, uploadSupplyImage.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file && req.file.path) {
      updateData.imageUrl = req.file.path;
    }
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.quantity) updateData.quantity = parseInt(updateData.quantity);
    if (updateData.expiryDate) updateData.expiryDate = new Date(updateData.expiryDate);
    if (updateData.location) updateData.location = JSON.parse(updateData.location);
    const result = await supplyController.updateSupply(req.params.id, req.user, updateData);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.json({ success: true, message: 'Supply updated successfully', data: result.supply });
  } catch (error) {
    console.error('Error updating supply:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/supplies/:id/quantity
// @desc    Update supply quantity (restocking)
// @access  Private
router.put('/:id/quantity', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (!quantity || isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const result = await InventoryService.updateSupplyQuantity(
      parseInt(req.params.id), 
      parseInt(quantity), 
      req.user.id
    );

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.json({
      success: true,
      message: result.message,
      data: result.updatedSupply
    });
  } catch (error) {
    console.error('Error updating supply quantity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/supplies/:id
// @desc    Delete a supply
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const supply = await Supply.findById(req.params.id);
    
    if (!supply) {
      return res.status(404).json({ success: false, message: 'Supply not found' });
    }

    // Check if the supply belongs to the current user OR if user is admin
    const isOwner = supply.supplierId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this supply' });
    }

    await Supply.findByIdAndDelete(req.params.id);

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
    const { quantity, deliveryAddress, contactPhone, notes } = req.body;
    const orderQuantity = parseInt(quantity) || 1;

    // Check stock availability
    const stockCheck = await InventoryService.checkStockAvailability(req.params.id, orderQuantity);
    
    if (!stockCheck.hasStock) {
      return res.status(400).json({ 
        success: false,
        message: stockCheck.error 
      });
    }

    // Reserve the quantity
    const reservation = await InventoryService.reserveQuantity(req.params.id, orderQuantity);
    
    if (!reservation.success) {
      return res.status(400).json({ 
        success: false,
        message: reservation.message 
      });
    }

    const totalPrice = stockCheck.supply.price * orderQuantity;

    // Create the order with inventory tracking
    const order = await SupplyOrder.create({
      supplyId: req.params.id,
      buyerId: req.user.id,
      supplierId: stockCheck.supply.supplierId,
      quantity: orderQuantity,
      totalPrice,
      deliveryAddress,
      contactPhone,
      notes,
      originalSupplyQuantity: reservation.originalQuantity,
      remainingSupplyQuantity: reservation.remainingQuantity
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
      inventoryUpdate: {
        originalQuantity: reservation.originalQuantity,
        remainingQuantity: reservation.remainingQuantity
      }
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
      orders = await SupplyOrder.find({ supplierId: req.user.id })
        .populate('supplyId', 'name category price unit availableQuantity')
        .populate('buyerId', 'name email phone')
        .sort({ orderDate: -1 });
    } else {
      // Get orders where user is the buyer
      orders = await SupplyOrder.find({ buyerId: req.user.id })
        .populate('supplyId', 'name category price unit availableQuantity')
        .populate('supplierId', 'name email phone')
        .sort({ orderDate: -1 });
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
    const order = await SupplyOrder.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.supplierId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // If order is being cancelled, restore the quantity
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const restoreResult = await InventoryService.restoreQuantity(order.supplyId.toString(), order.quantity);
      if (!restoreResult.success) {
        console.error('Failed to restore quantity:', restoreResult.message);
      }
    }

    const updatedOrder = await SupplyOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
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
    const suppliers = await User.find({ role: 'supplier' })
      .select('name email phone');
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