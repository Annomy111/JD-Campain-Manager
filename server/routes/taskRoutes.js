const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const checkTaskAccess = require('../middleware/checkTaskAccess');
const validate = require('../middleware/validate');
const taskValidation = require('../validation/taskValidation');
const errorHandler = require('../middleware/errorHandler');
const config = require('../config/constants');

// Base routes
router.get('/', [
  auth.protect,
  validate(taskValidation.getTasks),
  checkTaskAccess,
  errorHandler(taskController.getAllTasks)
]);

router.post('/', [
  auth.protect,
  validate(taskValidation.createTask),
  checkTaskAccess,
  errorHandler(taskController.createTask)
]);

router.get('/:id', [
  auth.protect,
  validate(taskValidation.getTask),
  checkTaskAccess,
  errorHandler(taskController.getTask)
]);

router.patch('/:id', [
  auth.protect,
  validate(taskValidation.updateTask),
  checkTaskAccess,
  errorHandler(taskController.updateTask)
]);

router.delete('/:id', [
  auth.protect,
  validate(taskValidation.deleteTask),
  checkTaskAccess,
  errorHandler(taskController.deleteTask)
]);

// Special actions
router.patch('/:id/progress', [
  auth.protect,
  validate(taskValidation.updateProgress),
  checkTaskAccess,
  errorHandler(taskController.updateTaskProgress)
]);

router.patch('/:id/toggle-complete', [
  auth.protect,
  validate(taskValidation.updateTask),
  checkTaskAccess,
  errorHandler(taskController.toggleTaskComplete)
]);

module.exports = router;