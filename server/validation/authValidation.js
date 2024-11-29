const Joi = require('joi');
const commonValidations = require('./common');

const authValidation = {
  register: Joi.object({
    email: commonValidations.email,
    password: commonValidations.password,
    firstName: commonValidations.name,
    lastName: commonValidations.name
  }),

  login: Joi.object({
    email: commonValidations.email,
    password: commonValidations.password
  })
};

module.exports = authValidation;