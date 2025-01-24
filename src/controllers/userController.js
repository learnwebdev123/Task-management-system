const User = require('../models/User');
const { validationResult } = require('express-validator');

const userController = {
  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { username, email, department, position } = req.body;
      
      // Check if email is already taken
      if (email) {
        const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
        if (existingUser) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            username,
            email,
            department,
            position
          }
        },
        { new: true, runValidators: true }
      ).select('-password');

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Upload avatar
  updateAvatar: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: { avatar: req.file.path }
        },
        { new: true }
      ).select('-password');

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .select('-password')
        .populate('projects', 'name status')
        .populate('assignedTasks', 'title status dueDate');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get all users (admin only)
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 });

      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Deactivate user account
  deactivateAccount: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { isActive: false } },
        { new: true }
      ).select('-password');

      res.json({ message: 'Account deactivated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = userController; 