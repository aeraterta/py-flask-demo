const User = require('../models').User;
const jwt = require('jsonwebtoken');

module.exports = {
  create(req, res) {
    return User
      .create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      })
      .then((user) => {
        const token = jwt.sign(user.toJSON(), 'secret', {
          expiresIn: 604800,
        });
        res.status(201).json({
          success: true,
          token,
          message: 'Successfully saved a new user with a token',
        });
      })
      .catch((error) => res.status(400).send(error));
  },

  list(req, res) {
    return User
      .findAll()
      .then((users) => {
        if (users === null) {
          res.status(200)
            .send('no users');
        } else {
          res.status(200)
            .send(users);
        }
      })
      .catch((error) => res.status(400).send(error.message));
  },

  retrieve(req, res) {
    return User
      .findOne({ where: { email: req.body.email } })
      .then((user) => {
        if (user) {
          if (User.validPassword(user, req.body.password)) {
            const token = jwt.sign(user.toJSON(), 'secret', {
              expiresIn: 604800,
            });
            res.status(200).json({
              success: true,
              token,
              message: 'Successfully Logged in',
            });
          } else {
            res.status(403).json({
              success: false,
              message: 'Authentication failed, Wrong password!',
            });
          }
        } else {
          res.status(403)
            .json({
              success: false,
              message: 'Authentication failed, User not found',
            });
        }
      })
      .catch((error) => res.status(400).json(error));
  },

  user(req, res) {
    return User
      .findOne({ where: { id: req.decoded.id } })
      .then((user) => {
        if (user) {
          res.status(200).json({
            success: true,
            user,
          });
        } else {
          res.status(403)
            .json({
              success: false,
              message: 'Authentication failed, User token expired',
            });
        }
      })
      .catch((error) => res.status(400).json(error));
  },
};
