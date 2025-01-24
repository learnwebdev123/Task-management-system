# Task Management System

A full-stack task management application built with Node.js, Express, MongoDB, and React. This system allows teams to manage tasks, collaborate on projects, and track progress efficiently.

## Features

### User Management
- User registration and authentication
- JWT-based authentication
- Profile management
- Role-based access control (Admin, Project Manager, Developer)

### Task Management
- Create, read, update, and delete tasks
- Task assignment and reassignment
- Priority levels (High, Medium, Low)
- Status tracking (Todo, In Progress, Completed)
- Due date management
- File attachments
- Task comments and discussions

### Project Management
- Project creation and management
- Team member assignment
- Project progress tracking
- Project-specific task organization

### Team Collaboration
- Team creation and management
- Member invitations
- Role-based permissions
- Real-time updates using WebSocket
- Comment system
- File sharing

### Additional Features
- Search functionality
- Task filtering and sorting
- Real-time notifications
- Activity tracking
- File upload and management

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO for real-time features
- JWT for authentication
- Bcrypt for password hashing

### Frontend
- React.js
- Tailwind CSS for styling
- Axios for API requests
- Socket.IO client

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository

git clone https://github.com/yourusername/task-management-system.git

cd task-management-system

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Install frontend dependencies

```bash
cd frontend
npm install
```

4. Create a .env file in the backend directory

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
```

5. Create a .env file in the frontend directory

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=http://localhost:5000
```

### Running the Application

1. Start the backend server

```bash
cd backend
npm run dev
```

2. Start the frontend application

```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user

### Users
- GET /api/users - Get all users
- PUT /api/users/profile - Update user profile
- POST /api/users/avatar - Upload user avatar

### Tasks
- GET /api/tasks - Get all tasks
- POST /api/tasks - Create new task
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task
- POST /api/tasks/:id/comments - Add comment
- POST /api/tasks/:id/attachments - Upload attachment

### Projects
- GET /api/projects - Get all projects
- POST /api/projects - Create new project
- PUT /api/projects/:id - Update project
- POST /api/projects/:id/members - Add team member

### Teams
- POST /api/teams - Create new team
- GET /api/teams/:id - Get team details
- POST /api/teams/:id/invite - Generate invite code
- POST /api/teams/join - Join team with invite code

## Project Structure

```
task-management-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── services/
    │   ├── utils/
    │   ├── App.js
    │   └── index.js
    └── package.json
```


