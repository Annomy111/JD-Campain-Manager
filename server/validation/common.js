const Joi = require('joi');
const config = require('../config/constants');

const commonValidations = {
  id: Joi.string().required().hex().length(24),
  email: Joi.string().required().email(),
  password: Joi.string()
    .min(config.validation.password.minLength)
    .max(config.validation.password.maxLength)
    .required(),
  name: Joi.string().min(2).max(50).required(),
  date: Joi.date().iso(),
  pagination: {
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(config.pagination.maxLimit).default(config.pagination.defaultLimit)
  }
};

module.exports = commonValidations;