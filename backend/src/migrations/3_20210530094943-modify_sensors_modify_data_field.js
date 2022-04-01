'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Sensors", "sensorId", {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false
      })
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Sensors", "sensorId", {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false
      })
    ])
  }
};
