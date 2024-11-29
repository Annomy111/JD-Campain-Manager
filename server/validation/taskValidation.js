const Joi = require('joi');

const taskValidation = {
  createTask: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500),
    category: Joi.string().required(),
    priority: Joi.string().valid('low', 'medium', 'high'),
    dueDate: Joi.date().greater('now'),
    assignedTo: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    districtId: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
  }),

  updateTask: Joi.object({
    title: Joi.string().min(3).max(100),
    description: Joi.string().max(500),
    category: Joi.string(),
    priority: Joi.string().valid('low', 'medium', 'high'),
    dueDate: Joi.date().greater('now'),
    assignedTo: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    districtId: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
  }),

  updateProgress: Joi.object({
    progress: Joi.number().min(0).max(100).required()
  })
};

module.exports = taskValidation; 