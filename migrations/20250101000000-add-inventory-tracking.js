'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add availableQuantity column to Supplies table
    await queryInterface.addColumn('Supplies', 'availableQuantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      after: 'quantity'
    });

    // Add inventory tracking columns to SupplyOrders table
    await queryInterface.addColumn('SupplyOrders', 'originalSupplyQuantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Quantity available in supply when order was placed'
    });

    await queryInterface.addColumn('SupplyOrders', 'remainingSupplyQuantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Remaining quantity in supply after order'
    });

    // Update existing supplies to set availableQuantity equal to quantity
    await queryInterface.sequelize.query(`
      UPDATE Supplies 
      SET availableQuantity = quantity 
      WHERE availableQuantity IS NULL OR availableQuantity = 0
    `);

    // Update existing orders to set default values
    await queryInterface.sequelize.query(`
      UPDATE SupplyOrders 
      SET originalSupplyQuantity = 0, remainingSupplyQuantity = 0 
      WHERE originalSupplyQuantity IS NULL OR remainingSupplyQuantity IS NULL
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove the columns in reverse order
    await queryInterface.removeColumn('SupplyOrders', 'remainingSupplyQuantity');
    await queryInterface.removeColumn('SupplyOrders', 'originalSupplyQuantity');
    await queryInterface.removeColumn('Supplies', 'availableQuantity');
  }
};
