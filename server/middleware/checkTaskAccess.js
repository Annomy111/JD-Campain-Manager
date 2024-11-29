const Task = require('../models/Task');
const AppError = require('../utils/errorHandler').AppError;

const checkTaskAccess = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return next(new AppError('Aufgabe nicht gefunden', 404));
    }

    const hasAccess = 
      req.user.role === 'admin' || 
      task.createdBy.toString() === req.user._id.toString() ||
      task.assignedTo?.toString() === req.user._id.toString();

    if (!hasAccess) {
      return next(new AppError('Keine Berechtigung für diese Aktion', 403));
    }

    req.task = task;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkTaskAccess; 