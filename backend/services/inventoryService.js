const { Supply, SupplyOrder } = require('../models');
const mongoose = require('mongoose');

class InventoryService {
  /**
   * Check if supply has enough quantity for order
   * @param {string} supplyId - Supply ID
   * @param {number} requestedQuantity - Quantity requested
   * @returns {Object} - { hasStock: boolean, availableQuantity: number, supply: Object }
   */
  static async checkStockAvailability(supplyId, requestedQuantity) {
    try {
      const supplyObjectId = mongoose.Types.ObjectId.isValid(supplyId) 
        ? new mongoose.Types.ObjectId(supplyId) 
        : supplyId;
      
      const supply = await Supply.findById(supplyObjectId);
      
      if (!supply) {
        return { hasStock: false, error: 'Supply not found' };
      }

      if (!supply.available) {
        return { hasStock: false, error: 'Supply is not available' };
      }

      const hasStock = supply.availableQuantity >= requestedQuantity;
      
      return {
        hasStock,
        availableQuantity: supply.availableQuantity,
        supply,
        error: hasStock ? null : `Only ${supply.availableQuantity} ${supply.unit}(s) available`
      };
    } catch (error) {
      console.error('Error checking stock availability:', error);
      return { hasStock: false, error: 'Error checking stock availability' };
    }
  }

  /**
   * Reserve quantity for an order
   * @param {string} supplyId - Supply ID
   * @param {number} quantity - Quantity to reserve
   * @returns {Object} - { success: boolean, message: string, updatedSupply: Object }
   */
  static async reserveQuantity(supplyId, quantity) {
    try {
      const supplyObjectId = mongoose.Types.ObjectId.isValid(supplyId) 
        ? new mongoose.Types.ObjectId(supplyId) 
        : supplyId;
      
      const supply = await Supply.findById(supplyObjectId);
      
      if (!supply) {
        return { success: false, message: 'Supply not found' };
      }

      if (supply.availableQuantity < quantity) {
        return { 
          success: false, 
          message: `Insufficient stock. Only ${supply.availableQuantity} ${supply.unit}(s) available` 
        };
      }

      // Update available quantity
      const newAvailableQuantity = supply.availableQuantity - quantity;
      await Supply.findByIdAndUpdate(supplyObjectId, { availableQuantity: newAvailableQuantity }, { new: true });
      
      const updatedSupply = await Supply.findById(supplyObjectId);

      return {
        success: true,
        message: 'Quantity reserved successfully',
        updatedSupply: updatedSupply,
        originalQuantity: supply.availableQuantity + quantity,
        remainingQuantity: newAvailableQuantity
      };
    } catch (error) {
      console.error('Error reserving quantity:', error);
      return { success: false, message: 'Error reserving quantity' };
    }
  }

  /**
   * Restore quantity when order is cancelled
   * @param {string} supplyId - Supply ID
   * @param {number} quantity - Quantity to restore
   * @returns {Object} - { success: boolean, message: string }
   */
  static async restoreQuantity(supplyId, quantity) {
    try {
      const supplyObjectId = mongoose.Types.ObjectId.isValid(supplyId) 
        ? new mongoose.Types.ObjectId(supplyId) 
        : supplyId;
      
      const supply = await Supply.findById(supplyObjectId);
      
      if (!supply) {
        return { success: false, message: 'Supply not found' };
      }

      const newAvailableQuantity = supply.availableQuantity + quantity;
      await Supply.findByIdAndUpdate(supplyObjectId, { availableQuantity: newAvailableQuantity }, { new: true });

      const updatedSupply = await Supply.findById(supplyObjectId);

      return {
        success: true,
        message: 'Quantity restored successfully',
        updatedSupply: updatedSupply
      };
    } catch (error) {
      console.error('Error restoring quantity:', error);
      return { success: false, message: 'Error restoring quantity' };
    }
  }

  /**
   * Get inventory summary for a supplier
   * @param {string} supplierId - Supplier ID
   * @returns {Object} - Inventory summary
   */
  static async getInventorySummary(supplierId) {
    try {
      const supplierObjectId = mongoose.Types.ObjectId.isValid(supplierId) 
        ? new mongoose.Types.ObjectId(supplierId) 
        : supplierId;
      
      const supplies = await Supply.find({ supplierId: supplierObjectId })
        .select('id name category quantity availableQuantity available price unit');

      const totalSupplies = supplies.length;
      const lowStockSupplies = supplies.filter(s => s.availableQuantity <= 5 && s.availableQuantity > 0);
      const outOfStockSupplies = supplies.filter(s => s.availableQuantity === 0);
      const totalValue = supplies.reduce((sum, s) => sum + (s.availableQuantity * s.price), 0);

      return {
        totalSupplies,
        lowStockSupplies: lowStockSupplies.length,
        outOfStockSupplies: outOfStockSupplies.length,
        totalValue: parseFloat(totalValue.toFixed(2)),
        supplies
      };
    } catch (error) {
      console.error('Error getting inventory summary:', error);
      return { error: 'Error getting inventory summary' };
    }
  }

  /**
   * Update supply quantity (for restocking)
   * @param {string} supplyId - Supply ID
   * @param {number} newQuantity - New total quantity
   * @param {string} userId - User ID (for authorization)
   * @returns {Object} - { success: boolean, message: string }
   */
  static async updateSupplyQuantity(supplyId, newQuantity, userId) {
    try {
      const supplyObjectId = mongoose.Types.ObjectId.isValid(supplyId) 
        ? new mongoose.Types.ObjectId(supplyId) 
        : supplyId;
      
      const supply = await Supply.findById(supplyObjectId);
      
      if (!supply) {
        return { success: false, message: 'Supply not found' };
      }

      const supplierId = supply.supplierId.toString();
      const userStringId = userId.toString();

      if (supplierId !== userStringId) {
        return { success: false, message: 'Not authorized to update this supply' };
      }

      if (newQuantity < 0) {
        return { success: false, message: 'Quantity cannot be negative' };
      }

      // Calculate how much to add to available quantity
      const quantityDifference = newQuantity - supply.quantity;
      const newAvailableQuantity = supply.availableQuantity + quantityDifference;

      if (newAvailableQuantity < 0) {
        return { success: false, message: 'Cannot reduce quantity below what is already ordered' };
      }

      await Supply.findByIdAndUpdate(supplyObjectId, {
        quantity: newQuantity,
        availableQuantity: newAvailableQuantity
      }, { new: true });

      const updatedSupply = await Supply.findById(supplyObjectId);

      return {
        success: true,
        message: 'Supply quantity updated successfully',
        updatedSupply: updatedSupply
      };
    } catch (error) {
      console.error('Error updating supply quantity:', error);
      return { success: false, message: 'Error updating supply quantity' };
    }
  }
}

module.exports = InventoryService;
