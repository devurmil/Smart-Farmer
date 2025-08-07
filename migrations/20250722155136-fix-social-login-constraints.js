'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if facebook_id column exists
    const tableDescription = await queryInterface.describeTable('users');
    
    if (!tableDescription.facebook_id) {
      await queryInterface.addColumn('users', 'facebook_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Facebook user ID for social login'
      });
      
      // Add unique constraint separately
      await queryInterface.addConstraint('users', {
        fields: ['facebook_id'],
        type: 'unique',
        name: 'users_facebook_id_unique'
      });
    }
    
    if (!tableDescription.google_id) {
      await queryInterface.addColumn('users', 'google_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Google user ID for social login'
      });
      
      // Add unique constraint separately
      await queryInterface.addConstraint('users', {
        fields: ['google_id'],
        type: 'unique',
        name: 'users_google_id_unique'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove constraints first
    try {
      await queryInterface.removeConstraint('users', 'users_facebook_id_unique');
    } catch (error) {
      console.log('Facebook ID constraint not found, skipping removal');
    }
    
    try {
      await queryInterface.removeConstraint('users', 'users_google_id_unique');
    } catch (error) {
      console.log('Google ID constraint not found, skipping removal');
    }
    
    // Remove columns
    try {
      await queryInterface.removeColumn('users', 'facebook_id');
    } catch (error) {
      console.log('Facebook ID column not found, skipping removal');
    }
    
    try {
      await queryInterface.removeColumn('users', 'google_id');
    } catch (error) {
      console.log('Google ID column not found, skipping removal');
    }
  }
}; 