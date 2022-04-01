const usersController = require('../controllers').users;
const sensorsController = require('../controllers').sensors;

const verifyToken = require('../middlewares/verify-token');

module.exports = (app) => {

  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the CBM API!',
  }));

  app.post('/api/auth/signup', usersController.create);
  app.post('/api/auth/login', usersController.retrieve);
  app.get('/api/auth/user', verifyToken, usersController.user);
  app.get('/api/users', usersController.list);

  app.post('/api/sensors/create', sensorsController.create);
  app.get('/api/sensors', sensorsController.list);

  app.all('/api/users/:userId/items', (req, res) => res.status(405).send({
    message: 'Method Not Allowed',
  }));
};
