const Team = require('../models/Team');
const User = require('../models/User');
const Project = require('../models/Project');
const crypto = require('crypto');

const teamController = {
  // Create new team
  createTeam: async (req, res) => {
    try {
      const { name, description, isPrivate } = req.body;

      const team = new Team({
        name,
        description,
        leader: req.user._id,
        members: [{
          user: req.user._id,
          role: 'admin'
        }],
        settings: {
          isPrivate: isPrivate || false
        }
      });

      await team.save();
      await team.populate('members.user', 'username email');
      
      res.status(201).json(team);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Generate invite code
  generateInviteCode: async (req, res) => {
    try {
      const { teamId } = req.params;
      const team = await Team.findById(teamId);

      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }

      // Generate random invite code
      const inviteCode = crypto.randomBytes(6).toString('hex');
      
      team.inviteCode = {
        code: inviteCode,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };

      await team.save();
      res.json({ inviteCode: team.inviteCode });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Join team with invite code
  joinTeam: async (req, res) => {
    try {
      const { inviteCode } = req.body;
      
      const team = await Team.findOne({
        'inviteCode.code': inviteCode,
        'inviteCode.expiresAt': { $gt: new Date() }
      });

      if (!team) {
        return res.status(400).json({ message: 'Invalid or expired invite code' });
      }

      // Check if user is already a member
      if (team.members.some(member => member.user.toString() === req.user._id.toString())) {
        return res.status(400).json({ message: 'Already a team member' });
      }

      team.members.push({
        user: req.user._id,
        role: 'member'
      });

      await team.save();
      await team.populate('members.user', 'username email');

      res.json(team);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get team projects
  getTeamProjects: async (req, res) => {
    try {
      const { teamId } = req.params;
      
      const projects = await Project.find({ team: teamId })
        .populate('manager', 'username email')
        .populate('team.user', 'username email')
        .sort({ createdAt: -1 });

      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Update team member role
  updateMemberRole: async (req, res) => {
    try {
      const { teamId, userId } = req.params;
      const { role } = req.body;

      const team = await Team.findById(teamId);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }

      const memberIndex = team.members.findIndex(
        member => member.user.toString() === userId
      );

      if (memberIndex === -1) {
        return res.status(404).json({ message: 'Member not found' });
      }

      team.members[memberIndex].role = role;
      await team.save();
      await team.populate('members.user', 'username email');

      res.json(team);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = teamController;