const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    hooks: {
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync();
        // eslint-disable-next-line no-param-reassign
        user.password = bcrypt.hashSync(user.password, salt);
      },
    },
  });
  // eslint-disable-next-line func-names
  User.validPassword = function (user, password) {
    return bcrypt.compareSync(password, user.password);
  };
  return User;
};
