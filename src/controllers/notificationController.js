const Notification = require('../models/Notification');

const notificationController = {
  // Get user notifications
  getNotifications: async (req, res) => {
    try {
      const notifications = await Notification.find({
        recipient: req.user._id
      })
      .sort({ createdAt: -1 })
      .limit(50);

      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          recipient: req.user._id
        },
        {
          read: true,
          readAt: new Date()
        },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req, res) => {
    try {
      await Notification.updateMany(
        {
          recipient: req.user._id,
          read: false
        },
        {
          read: true,
          readAt: new Date()
        }
      );

      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = notificationController;