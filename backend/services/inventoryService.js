const { Supply, SupplyOrder } = require('../models');

class InventoryService {
  /**
   * Check if supply has enough quantity for order
   * @param {number} supplyId - Supply ID
   * @param {number} requestedQuantity - Quantity requested
   * @returns {Object} - { hasStock: boolean, availableQuantity: number, supply: Object }
   */
  static async checkStockAvailability(supplyId, requestedQuantity) {
    try {
      const supply = await Supply.findByPk(supplyId);
      
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
   * @param {number} supplyId - Supply ID
   * @param {number} quantity - Quantity to reserve
   * @returns {Object} - { success: boolean, message: string, updatedSupply: Object }
   */
  static async reserveQuantity(supplyId, quantity) {
    try {
      const supply = await Supply.findByPk(supplyId);
      
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
      await supply.update({ availableQuantity: newAvailableQuantity });

      return {
        success: true,
        message: 'Quantity reserved successfully',
        updatedSupply: supply,
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
   * @param {number} supplyId - Supply ID
   * @param {number} quantity - Quantity to restore
   * @returns {Object} - { success: boolean, message: string }
   */
  static async restoreQuantity(supplyId, quantity) {
    try {
      const supply = await Supply.findByPk(supplyId);
      
      if (!supply) {
        return { success: false, message: 'Supply not found' };
      }

      const newAvailableQuantity = supply.availableQuantity + quantity;
      await supply.update({ availableQuantity: newAvailableQuantity });

      return {
        success: true,
        message: 'Quantity restored successfully',
        updatedSupply: supply
      };
    } catch (error) {
      console.error('Error restoring quantity:', error);
      return { success: false, message: 'Error restoring quantity' };
    }
  }

  /**
   * Get inventory summary for a supplier
   * @param {string} supplierId - Supplier UUID
   * @returns {Object} - Inventory summary
   */
  static async getInventorySummary(supplierId) {
    try {
      const supplies = await Supply.findAll({
        where: { supplierId },
        attributes: [
          'id',
          'name',
          'category',
          'quantity',
          'availableQuantity',
          'available',
          'price',
          'unit'
        ]
      });

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
   * @param {number} supplyId - Supply ID
   * @param {number} newQuantity - New total quantity
   * @param {string} userId - User ID (for authorization)
   * @returns {Object} - { success: boolean, message: string }
   */
  static async updateSupplyQuantity(supplyId, newQuantity, userId) {
    try {
      const supply = await Supply.findByPk(supplyId);
      
      if (!supply) {
        return { success: false, message: 'Supply not found' };
      }

      if (supply.supplierId !== userId) {
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

      await supply.update({
        quantity: newQuantity,
        availableQuantity: newAvailableQuantity
      });

      return {
        success: true,
        message: 'Supply quantity updated successfully',
        updatedSupply: supply
      };
    } catch (error) {
      console.error('Error updating supply quantity:', error);
      return { success: false, message: 'Error updating supply quantity' };
    }
  }
}

module.exports = InventoryService;
