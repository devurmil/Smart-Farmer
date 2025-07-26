'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'facebook_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
      comment: 'Facebook user ID for social login'
    });

    await queryInterface.addColumn('users', 'google_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
      comment: 'Google user ID for social login'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'facebook_id');
    await queryInterface.removeColumn('users', 'google_id');
  }
}; 