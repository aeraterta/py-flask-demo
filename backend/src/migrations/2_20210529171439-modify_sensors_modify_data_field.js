'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    return Promise.all([
      queryInterface.changeColumn("Sensors", "data", {
        type: `${Sequelize.JSONB} using to_jsonb(data)`,
        allowNull: false
      })
    ])
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return Promise.all([
      queryInterface.changeColumn("Sensors", "data", {
        type: `${Sequelize.JSONB} using to_jsonb(data)`,
        allowNull: false
      })
    ])
  }
};
