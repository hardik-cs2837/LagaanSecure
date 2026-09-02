'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query('ALTER TYPE "enum_users_role" ADD VALUE \'admin\';');
    } catch(e) {}
  },
  async down() {}
};
