const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Controllers
const authController = require('../controllers/authController');
const taskController = require('../controllers/taskController');
const projectController = require('../controllers/projectController');
const teamController = require('../controllers/teamController');
const userController = require('../controllers/userController');

// Authentication Routes
router.post('/auth/register', [
  check('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  check('email').isEmail().withMessage('Must be a valid email'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
], authController.register);

router.post('/auth/login', [
  check('email').isEmail(),
  check('password').exists(),
  validate
], authController.login);

// User Routes
router.get('/users/me', auth, userController.getCurrentUser);
router.put('/users/profile', [
  auth,
  check('email').optional().isEmail(),
  check('username').optional().trim().isLength({ min: 3 }),
  validate
], userController.updateProfile);

// Task Routes
router.post('/tasks', [
  auth,
  check('title').trim().notEmpty().withMessage('Title is required'),
  check('description').trim().notEmpty().withMessage('Description is required'),
  check('priority').optional().isIn(['low', 'medium', 'high']),
  check('dueDate').optional().isISO8601(),
  validate
], taskController.createTask);

router.get('/tasks', auth, taskController.getTasks);

router.put('/tasks/:id', [
  auth,
  check('title').optional().trim().notEmpty(),
  check('status').optional().isIn(['todo', 'in_progress', 'completed']),
  validate
], taskController.updateTask);

router.delete('/tasks/:id', auth, taskController.deleteTask);

router.post('/tasks/:id/comments', [
  auth,
  check('text').trim().notEmpty().withMessage('Comment text is required'),
  validate
], taskController.addComment);

// Project Routes
router.post('/projects', [
  auth,
  authorize('admin', 'project_manager'),
  check('name').trim().notEmpty().withMessage('Project name is required'),
  check('description').trim().notEmpty(),
  check('startDate').isISO8601(),
  check('endDate').isISO8601(),
  validate
], projectController.createProject);

router.get('/projects', auth, projectController.getProjects);

router.put('/projects/:id', [
  auth,
  authorize('admin', 'project_manager'),
  check('name').optional().trim().notEmpty(),
  check('status').optional().isIn(['planning', 'active', 'on_hold', 'completed', 'cancelled']),
  validate
], projectController.updateProject);

router.post('/projects/:id/members', [
  auth,
  authorize('admin', 'project_manager'),
  check('userId').notEmpty(),
  check('role').isIn(['developer', 'designer', 'tester', 'analyst']),
  validate
], projectController.addTeamMember);

// Team Routes
router.post('/teams', [
  auth,
  check('name').trim().notEmpty().withMessage('Team name is required'),
  validate
], teamController.createTeam);

router.get('/teams/:id/members', auth, teamController.getTeamMembers);

router.post('/teams/join', [
  auth,
  check('inviteCode').notEmpty(),
  validate
], teamController.joinTeam);

// Notification Routes
router.get('/notifications', auth, notificationController.getNotifications);
router.put('/notifications/:id/read', auth, notificationController.markAsRead);

module.exports = router;