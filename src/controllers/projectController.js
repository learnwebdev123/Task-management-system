const Project = require('../models/Project');
const User = require('../models/User');
const { validationResult } = require('express-validator');

const projectController = {
  // Create new project
  createProject: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        description,
        startDate,
        endDate,
        category,
        priority,
        team
      } = req.body;

      const project = new Project({
        name,
        description,
        startDate,
        endDate,
        category,
        priority,
        manager: req.user._id,
        team: team || []
      });

      await project.save();

      // Add project to team members' projects
      const teamUserIds = project.team.map(member => member.user);
      await User.updateMany(
        { _id: { $in: teamUserIds } },
        { $push: { projects: project._id } }
      );

      await project.populate('team.user', 'username email');
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get all projects
  getProjects: async (req, res) => {
    try {
      const { status, category } = req.query;
      const filter = {};

      if (status) filter.status = status;
      if (category) filter.category = category;

      const projects = await Project.find(filter)
        .populate('manager', 'username email')
        .populate('team.user', 'username email')
        .sort({ createdAt: -1 });

      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Update project
  updateProject: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Update project fields
      Object.keys(updates).forEach(update => project[update] = updates[update]);
      await project.save();

      await project.populate(['manager', 'team.user', 'tasks']);
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Add team member
  addTeamMember: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, role } = req.body;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Check if user already in team
      if (project.team.some(member => member.user.toString() === userId)) {
        return res.status(400).json({ message: 'User already in team' });
      }

      project.team.push({
        user: userId,
        role
      });

      await project.save();
      await User.findByIdAndUpdate(userId, {
        $push: { projects: project._id }
      });

      await project.populate('team.user', 'username email');
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Update project progress
  updateProgress: async (req, res) => {
    try {
      const { id } = req.params;
      const project = await Project.findById(id);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const progress = await project.calculateProgress();
      res.json({ progress });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = projectController;