'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn('farms', 'coordinates', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of {lat, lng} objects representing the farm boundary polygon'
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('farms', 'coordinates');
  }
};
