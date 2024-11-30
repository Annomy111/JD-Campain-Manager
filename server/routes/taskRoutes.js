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
const taskMiddleware = (validationSchema, ttl) => {
  const middlewares = [auth.protect];
  
  if (validationSchema) {
    middlewares.push(validate(validationSchema));
  }
  
  middlewares.push(checkTaskAccess);
  
  if (ttl) {
    middlewares.push(cache.route({ ttl }));
  }
  
  return middlewares;
};

// Base routes
router.route('/')
  .get(
    ...taskMiddleware(taskValidation.getTasks, config.cache.defaultTTL),
    errorHandler(taskController.getAllTasks)
  )
  .post(
    ...taskMiddleware(taskValidation.createTask),
    errorHandler(taskController.createTask)
  );

router.route('/:id')
  .get(
    ...taskMiddleware(taskValidation.getTask, config.cache.shortTTL),
    errorHandler(taskController.getTask)
  )
  .patch(
    ...taskMiddleware(taskValidation.updateTask),
    errorHandler(taskController.updateTask)
  )
  .delete(
    ...taskMiddleware(taskValidation.deleteTask),
    errorHandler(taskController.deleteTask)
  );

// Special actions
router.patch('/:id/progress',
  ...taskMiddleware(taskValidation.updateProgress),
  errorHandler(taskController.updateTaskProgress)
);

router.patch('/:id/toggle-complete',
  ...taskMiddleware(taskValidation.toggleComplete),
  errorHandler(taskController.toggleTaskComplete)
);

module.exports = router;