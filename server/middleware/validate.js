const { validationResult } = require('express-validator');
const AppError = require('../utils/errorHandler').AppError;

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return next(new AppError(errorMessages.join('. '), 422, 'validation'));
    }
    next();
  };
};

module.exports = validate;
