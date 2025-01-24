const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const teamController = require('../controllers/teamController');
const { auth, authorize } = require('../middleware/auth');

// Validation middleware
const teamValidation = [
  check('name', 'Team name is required').not().isEmpty(),
  check('description').optional().trim()
];

// Routes
router.post('/',
  auth,
  teamValidation,
  teamController.createTeam
);

router.post('/:teamId/invite',
  auth,
  authorize('admin', 'lead'),
  teamController.generateInviteCode
);

router.post('/join',
  auth,
  check('inviteCode', 'Invite code is required').not().isEmpty(),
  teamController.joinTeam
);

router.get('/:teamId/projects',
  auth,
  teamController.getTeamProjects
);

router.put('/:teamId/members/:userId/role',
  auth,
  authorize('admin'),
  check('role').isIn(['member', 'lead', 'admin']),
  teamController.updateMemberRole
);

module.exports = router;