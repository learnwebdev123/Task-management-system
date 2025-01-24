const Task = require('../models/Task');
const Project = require('../models/Project');
const { validationResult } = require('express-validator');
const Notification = require('../models/Notification');

const taskController = {
  // Create new task
  createTask: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, priority, assignedTo, project, dueDate } = req.body;

      // Verify project exists
      if (project) {
        const projectExists = await Project.findById(project);
        if (!projectExists) {
          return res.status(404).json({ message: 'Project not found' });
        }
      }

      const task = new Task({
        title,
        description,
        priority,
        assignedTo,
        project,
        dueDate,
        createdBy: req.user._id
      });

      await task.save();

      // Update project with new task
      if (project) {
        await Project.findByIdAndUpdate(project, {
          $push: { tasks: task._id }
        });
      }

      await task.populate(['assignedTo', 'createdBy']);

      // Get socketService
      const socketService = req.app.get('socketService');

      // Create notification for assigned user
      if (task.assignedTo) {
        const notification = await Notification.create({
          recipient: task.assignedTo,
          type: 'task_assignment',
          title: 'New Task Assignment',
          message: `You have been assigned to task: ${task.title}`,
          reference: {
            type: 'task',
            id: task._id
          }
        });

        // Send real-time notification
        socketService.sendNotification(task.assignedTo, notification);
      }

      // Send task update to project room
      if (task.project) {
        socketService.sendTaskUpdate(task.project, task);
      }

      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get all tasks (with filters)
  getTasks: async (req, res) => {
    try {
      const {
        status,
        priority,
        project,
        assignedTo,
        startDate,
        endDate,
        search,
        sortBy,
        sortOrder,
        page = 1,
        limit = 10,
        tags
      } = req.query;

      // Build filter object
      const filter = {};

      // Basic filters
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (project) filter.project = project;
      if (assignedTo) filter.assignedTo = assignedTo;
      if (tags) filter.tags = { $in: tags.split(',') };

      // Date range filter
      if (startDate || endDate) {
        filter.dueDate = {};
        if (startDate) filter.dueDate.$gte = new Date(startDate);
        if (endDate) filter.dueDate.$lte = new Date(endDate);
      }

      // Text search
      if (search) {
        filter.$text = { $search: search };
      }

      // Build sort object
      const sort = {};
      if (sortBy) {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      } else {
        sort.createdAt = -1; // Default sort by creation date
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query
      const tasks = await Task.find(filter)
        .populate('assignedTo', 'username email')
        .populate('project', 'name')
        .populate('createdBy', 'username')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const total = await Task.countDocuments(filter);

      res.json({
        tasks,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Update task
  updateTask: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Update task
      Object.keys(updates).forEach(update => task[update] = updates[update]);
      await task.save();

      await task.populate(['assignedTo', 'project', 'createdBy']);
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Delete task
  deleteTask: async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Remove task from project
      if (task.project) {
        await Project.findByIdAndUpdate(task.project, {
          $pull: { tasks: task._id }
        });
      }

      await task.remove();
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Add comment to task
  addComment: async (req, res) => {
    try {
      const { id } = req.params;
      const { text } = req.body;

      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      task.comments.push({
        text,
        user: req.user._id
      });

      await task.save();
      await task.populate('comments.user', 'username');
      
      res.json(task.comments[task.comments.length - 1]);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Add bulk update method
  bulkUpdateTasks: async (req, res) => {
    try {
      const { tasks } = req.body; // Array of {id, updates}
      
      const updatePromises = tasks.map(task => 
        Task.findByIdAndUpdate(
          task.id,
          { $set: task.updates },
          { new: true }
        )
      );

      const updatedTasks = await Promise.all(updatePromises);
      res.json(updatedTasks);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Add task statistics
  getTaskStats: async (req, res) => {
    try {
      const stats = await Task.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            averageEstimatedTime: { $avg: '$estimatedTime' },
            averageActualTime: { $avg: '$actualTime' }
          }
        }
      ]);

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = taskController;