const config = require('../config/constants');

const errorHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    console.error(`Error in ${fn.name}:`, error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validierungsfehler',
        errors: error.errors
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Ungültiger Token'
      });
    }

    // Default error response
    res.status(500).json({ 
      message: config.errorMessages.auth.serverError,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = errorHandler;