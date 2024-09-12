"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "verifyToken", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Users", "verifyTokenExpiry", {
      type: Sequelize.DATE,
    });
    await queryInterface.addColumn("Users", "resetToken", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Users", "resetTokenExpiry", {
      type: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
