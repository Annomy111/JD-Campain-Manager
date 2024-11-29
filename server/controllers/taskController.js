const Task = require('../models/Task');
const { AppError } = require('../utils/errorHandler');
const { validateTaskData } = require('../utils/errorHandler');

// Hilfsfunktion für Pagination
const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

// Hilfsfunktion für Sortierung
const getSortOptions = (sortBy = 'createdAt', sortOrder = 'desc') => {
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  return sortOptions;
};

// Controller-Methoden
exports.createTask = async (req, res, next) => {
  try {
    const validation = validateTaskData(req.body);
    if (!validation.isValid) {
      return next(new AppError(validation.errors.join(', '), 400, 'validation'));
    }

    const task = new Task({
      ...req.body,
      createdBy: req.user._id
    });

    const savedTask = await task.save();
    await savedTask.populate(['districtId', 'createdBy']);

    res.status(201).json({
      status: 'success',
      data: savedTask
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllTasks = async (req, res, next) => {
  try {
    const { page, size, sortBy, sortOrder, category, status, assignedTo, districtId } = req.query;
    const { limit, offset } = getPagination(page, size);
    const sort = getSortOptions(sortBy, sortOrder);

    // Filter-Optionen
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (districtId) filter.districtId = districtId;

    const tasks = await Task.find(filter)
      .populate(['districtId', 'createdBy'])
      .sort(sort)
      .skip(offset)
      .limit(limit);

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: tasks,
      pagination: {
        total,
        page: page ? +page : 0,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate(['districtId', 'createdBy']);

    if (!task) {
      return next(new AppError('Aufgabe nicht gefunden', 404, 'notFound'));
    }

    res.status(200).json({
      status: 'success',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const validation = validateTaskData(req.body);
    if (!validation.isValid) {
      return next(new AppError(validation.errors.join(', '), 400, 'validation'));
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user._id
      },
      {
        new: true,
        runValidators: true
      }
    ).populate(['districtId', 'createdBy']);

    if (!task) {
      return next(new AppError('Aufgabe nicht gefunden', 404, 'notFound'));
    }

    res.status(200).json({
      status: 'success',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return next(new AppError('Aufgabe nicht gefunden', 404, 'notFound'));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTaskProgress = async (req, res, next) => {
  try {
    const { progress } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new AppError('Aufgabe nicht gefunden', 404, 'notFound'));
    }

    await task.updateProgress(progress);
    await task.populate(['districtId', 'createdBy']);

    res.status(200).json({
      status: 'success',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleTaskComplete = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new AppError('Aufgabe nicht gefunden', 404, 'notFound'));
    }

    await task.toggleComplete();
    await task.populate(['districtId', 'createdBy']);

    res.status(200).json({
      status: 'success',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

exports.addTaskAttachment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new AppError('Aufgabe nicht gefunden', 404, 'notFound'));
    }

    const attachment = {
      name: req.body.name,
      url: req.body.url,
      type: req.body.type,
      size: req.body.size
    };

    await task.addAttachment(attachment);
    await task.populate(['districtId', 'createdBy']);

    res.status(200).json({
      status: 'success',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

exports.removeTaskAttachment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new AppError('Aufgabe nicht gefunden', 404, 'notFound'));
    }

    await task.removeAttachment(req.params.attachmentId);
    await task.populate(['districtId', 'createdBy']);

    res.status(200).json({
      status: 'success',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

exports.getTaskStatistics = async (req, res, next) => {
  try {
    const statistics = await Task.getTaskStatistics();

    res.status(200).json({
      status: 'success',
      data: statistics
    });
  } catch (error) {
    next(error);
  }
};

exports.getOverdueTasks = async (req, res, next) => {
  try {
    const tasks = await Task.findOverdueTasks()
      .populate(['districtId', 'createdBy']);

    res.status(200).json({
      status: 'success',
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

exports.getTasksByDistrict = async (req, res, next) => {
  try {
    const tasks = await Task.findTasksByDistrict(req.params.districtId)
      .populate(['districtId', 'createdBy']);

    res.status(200).json({
      status: 'success',
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};
