const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { auth, authorize } = require('../middleware/auth');
const taskController = require('../controllers/taskController');
const projectController = require('../controllers/projectController');

// Validation middleware
const registerValidation = [
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', auth, authController.getCurrentUser);
router.post('/change-password', auth, authController.changePassword);
router.post('/logout', auth, authController.logout);
router.post('/tasks', auth, taskController.createTask);
router.put('/projects/:id', auth, authorize('admin', 'project_manager'), projectController.updateProject);

module.exports = router;