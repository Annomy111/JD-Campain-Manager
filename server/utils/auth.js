const jwt = require('jsonwebtoken');
const config = require('../config/constants');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || config.jwt.defaultSecret,
    { expiresIn: config.jwt.expiresIn }
  );
};

const formatUserResponse = (user) => ({
  id: user._id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role
});

module.exports = {
  generateToken,
  formatUserResponse
};