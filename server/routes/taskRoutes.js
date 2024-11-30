const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const checkTaskAccess = require('../middleware/checkTaskAccess');
const validate = require('../middleware/validate');
const cache = require('../middleware/cache');
const taskValidation = require('../validation/taskValidation');
const errorHandler = require('../middleware/errorHandler');
const config = require('../config/constants');

// Middleware composition
const composeMiddleware = (validationSchema, ttl, controller) => {
  const middlewares = [auth.protect];
  
  if (validationSchema) {
    middlewares.push(validate(validationSchema));
  }
  
  middlewares.push(checkTaskAccess);
  
  if (ttl) {
    middlewares.push(cache.route({ ttl }));
  }
  
  // Add the error-wrapped controller as the final middleware
  middlewares.push(errorHandler(controller));
  
  return middlewares;
};

// Base routes
router.route('/')
  .get(
    ...composeMiddleware(
      taskValidation.getTasks,
      config.cache.defaultTTL,
      taskController.getAllTasks
    )
  )
  .post(
    ...composeMiddleware(
      taskValidation.createTask,
      null,
      taskController.createTask
    )
  );

router.route('/:id')
  .get(
    ...composeMiddleware(
      taskValidation.getTask,
      config.cache.shortTTL,
      taskController.getTask
    )
  )
  .patch(
    ...composeMiddleware(
      taskValidation.updateTask,
      null,
      taskController.updateTask
    )
  )
  .delete(
    ...composeMiddleware(
      taskValidation.deleteTask,
      null,
      taskController.deleteTask
    )
  );

// Special actions
router.patch('/:id/progress',
  ...composeMiddleware(
    taskValidation.updateProgress,
    null,
    taskController.updateTaskProgress
  )
);

router.patch('/:id/toggle-complete',
  ...composeMiddleware(
    taskValidation.toggleComplete,
    null,
    taskController.toggleTaskComplete
  )
);

module.exports = router;