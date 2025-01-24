const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const taskController = require('../controllers/taskController');
const { auth, authorize } = require('../middleware/auth');

// Validation middleware
const taskValidation = [
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('priority').optional().isIn(['low', 'medium', 'high']),
  check('dueDate').optional().isISO8601()
];

// Routes
router.post('/', 
  auth, 
  taskValidation,
  taskController.createTask
);

router.get('/', 
  auth, 
  taskController.getTasks
);

router.put('/:id', 
  auth,
  taskController.updateTask
);

router.delete('/:id',
  auth,
  authorize('admin', 'project_manager'),
  taskController.deleteTask
);

router.post('/:id/comments',
  auth,
  check('text', 'Comment text is required').not().isEmpty(),
  taskController.addComment
);

router.post('/bulk-update',
  auth,
  authorize('admin', 'project_manager'),
  taskController.bulkUpdateTasks
);

router.get('/stats',
  auth,
  taskController.getTaskStats
);

module.exports = router;