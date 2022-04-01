module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Sensor', {
    sensor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sensorId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    moduleId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
    }
  });
};
