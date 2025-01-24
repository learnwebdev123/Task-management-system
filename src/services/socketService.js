const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketService {
  constructor(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.userSockets = new Map(); // Store user socket connections

    this.setupSocketAuth();
    this.setupEventHandlers();
  }

  setupSocketAuth() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('Authentication error');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId}`);
      
      // Store user socket connection
      this.userSockets.set(socket.userId.toString(), socket);

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        this.userSockets.delete(socket.userId.toString());
      });

      // Join project room
      socket.on('join_project', (projectId) => {
        socket.join(`project:${projectId}`);
      });

      // Leave project room
      socket.on('leave_project', (projectId) => {
        socket.leave(`project:${projectId}`);
      });
    });
  }

  // Send notification to specific user
  sendNotification(userId, notification) {
    const userSocket = this.userSockets.get(userId.toString());
    if (userSocket) {
      userSocket.emit('notification', notification);
    }
  }

  // Send update to project room
  sendProjectUpdate(projectId, updateData) {
    this.io.to(`project:${projectId}`).emit('project_update', updateData);
  }

  // Send task update to project room
  sendTaskUpdate(projectId, taskData) {
    this.io.to(`project:${projectId}`).emit('task_update', taskData);
  }

  // Send comment update to project room
  sendCommentUpdate(projectId, commentData) {
    this.io.to(`project:${projectId}`).emit('comment_update', commentData);
  }
}

module.exports = SocketService;