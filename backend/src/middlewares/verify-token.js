const jwt = require('jsonwebtoken');

// eslint-disable-next-line func-names
module.exports = function (req, res, next) {
  // eslint-disable-next-line dot-notation
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  const checkBearer = 'Bearer ';

  if (token) {
    if (token.startsWith(checkBearer)) {
      token = token.slice(checkBearer.length, token.length);
    }
    jwt.verify(token, 'secret', (err, decoded) => {
      if (err) {
        res.json({
          success: false,
          message: 'Failed to authenticate, token expired',
        });
      } else {
        // eslint-disable-next-line no-param-reassign
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.json({
      success: false,
      message: 'No token Provided',
    });
  }
};
