const { Supply, User } = require('../models');
const InventoryService = require('../services/inventoryService');
const mongoose = require('mongoose');

// Get all supplies (with supplier details)
exports.getAllSupplies = async (whereClause = {}, order = [['createdAt', 'DESC']]) => {
  const sortField = order[0] && order[0][0] ? order[0][0] : 'createdAt';
  const sortOrder = order[0] && order[0][1] === 'DESC' ? -1 : 1;
  
  return Supply.find(whereClause)
    .populate('supplierId', 'name email phone')
    .sort({ [sortField]: sortOrder });
};

// Get supply by ID (with supplier details)
exports.getSupplyById = async (id) => {
  const supplyObjectId = mongoose.Types.ObjectId.isValid(id) 
    ? new mongoose.Types.ObjectId(id) 
    : id;
  
  return Supply.findById(supplyObjectId)
    .populate('supplierId', 'name email phone');
};

// Update supply by ID (admin or owner)
exports.updateSupply = async (id, user, updateData) => {
  const supplyObjectId = mongoose.Types.ObjectId.isValid(id) 
    ? new mongoose.Types.ObjectId(id) 
    : id;
  
  const supply = await Supply.findById(supplyObjectId);
  if (!supply) return { error: 'Supply not found', status: 404 };
  
  const supplierId = supply.supplierId.toString();
  const userId = user.id.toString();
  
  if (supplierId !== userId && user.role !== 'admin') {
    return { error: 'Not authorized to update this supply', status: 403 };
  }
  
  await Supply.findByIdAndUpdate(supplyObjectId, updateData, { new: true });
  const updatedSupply = await Supply.findById(supplyObjectId);
  
  return { supply: updatedSupply };
};

// Delete supply by ID (admin or owner)
exports.deleteSupply = async (id, user) => {
  const supplyObjectId = mongoose.Types.ObjectId.isValid(id) 
    ? new mongoose.Types.ObjectId(id) 
    : id;
  
  const supply = await Supply.findById(supplyObjectId);
  if (!supply) return { error: 'Supply not found', status: 404 };
  
  const supplierId = supply.supplierId.toString();
  const userId = user.id.toString();
  
  if (supplierId !== userId && user.role !== 'admin') {
    return { error: 'Not authorized to delete this supply', status: 403 };
  }
  
  await Supply.findByIdAndDelete(supplyObjectId);
  return { message: 'Supply deleted successfully' };
};

// Get inventory summary for supplier
exports.getInventorySummary = async (supplierId) => {
  return InventoryService.getInventorySummary(supplierId);
};

// Update supply quantity (restocking)
exports.updateSupplyQuantity = async (supplyId, newQuantity, userId) => {
  return InventoryService.updateSupplyQuantity(supplyId, newQuantity, userId);
};

// Check stock availability
exports.checkStockAvailability = async (supplyId, requestedQuantity) => {
  return InventoryService.checkStockAvailability(supplyId, requestedQuantity);
};
