const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const checkTaskAccess = require('../middleware/checkTaskAccess');
const validateJoi = require('../middleware/validateJoi');
const taskValidation = require('../validation/taskValidation');

// Base routes
router.get('/', 
  auth,
  taskController.getAllTasks
);

router.post('/',
  auth,
  validateJoi(taskValidation.createTask),
  taskController.createTask
);

router.get('/:id',
  auth,
  checkTaskAccess,
  taskController.getTask
);

router.patch('/:id',
  auth,
  validateJoi(taskValidation.updateTask),
  checkTaskAccess,
  taskController.updateTask
);

router.delete('/:id',
  auth,
  checkTaskAccess,
  taskController.deleteTask
);

// Special actions
router.patch('/:id/progress',
  auth,
  validateJoi(taskValidation.updateProgress),
  checkTaskAccess,
  taskController.updateTaskProgress
);

router.patch('/:id/toggle-complete',
  auth,
  validateJoi(taskValidation.updateTask),
  checkTaskAccess,
  taskController.toggleTaskComplete
);

module.exports = router;