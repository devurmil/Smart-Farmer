'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "profile_picture", {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "Cloudinary URL for user profile picture"
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "profile_picture");
  }
};
