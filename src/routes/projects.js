const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const projectController = require('../controllers/projectController');
const { auth, authorize } = require('../middleware/auth');

// Validation middleware
const projectValidation = [
  check('name', 'Project name is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('startDate', 'Start date is required').isISO8601(),
  check('endDate', 'End date is required').isISO8601(),
  check('category').isIn(['development', 'design', 'marketing', 'research', 'other']),
  check('priority').optional().isIn(['low', 'medium', 'high'])
];

// Routes
router.post('/',
  auth,
  authorize('admin', 'project_manager'),
  projectValidation,
  projectController.createProject
);

router.get('/',
  auth,
  projectController.getProjects
);

router.put('/:id',
  auth,
  authorize('admin', 'project_manager'),
  projectController.updateProject
);

router.post('/:id/team',
  auth,
  authorize('admin', 'project_manager'),
  [
    check('userId', 'User ID is required').not().isEmpty(),
    check('role').isIn(['developer', 'designer', 'tester', 'analyst'])
  ],
  projectController.addTeamMember
);

router.put('/:id/progress',
  auth,
  authorize('admin', 'project_manager'),
  projectController.updateProgress
);

module.exports = router;