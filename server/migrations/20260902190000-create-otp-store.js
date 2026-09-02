'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('otp_store', {
      identifier: { type: Sequelize.STRING, primaryKey: true },
      otp: { type: Sequelize.STRING, allowNull: false },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      attempts: { type: Sequelize.INTEGER, defaultValue: 0 },
      last_sent: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      purpose: { type: Sequelize.STRING, defaultValue: 'verification' }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('otp_store');
  }
};
