const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const errorHandler = require('../middleware/errorHandler');
const { generateToken, formatUserResponse } = require('../utils/auth');
const config = require('../config/constants');
const validate = require('../middleware/validate');
const authValidation = require('../validation/authValidation');

// Registration
router.post('/register', 
  validate(authValidation.register),
  errorHandler(async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        message: config.errorMessages.auth.userExists 
      });
    }

    user = new User({
      email,
      password,
      firstName,
      lastName
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: formatUserResponse(user)
    });
  })
);

// Login
router.post('/login',
  validate(authValidation.login),
  errorHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ 
        message: config.errorMessages.auth.invalidCredentials 
      });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: formatUserResponse(user)
    });
  })
);

// Get user information
router.get('/me', 
  auth,
  errorHandler(async (req, res) => {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(formatUserResponse(user));
  })
);

module.exports = router;