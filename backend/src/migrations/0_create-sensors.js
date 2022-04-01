module.exports = {
    up: (queryInterface, Sequelize) =>
        queryInterface.createTable('Sensors', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            sensor: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            sensorId: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: true,
            },
            moduleId: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            data: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        }),
    down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('Sensors'),
};
