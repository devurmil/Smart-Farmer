'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('farms', 'coordinates', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of {lat, lng} objects representing the farm boundary polygon'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('farms', 'coordinates');
  }
};
