# Team Task Manager Full-Stack App

A modern, role-based project and task management web application built using the MERN stack (MongoDB, Express, React, Node.js).

## Key Features
- **Role-Based Access Control:** Admin and Member roles with specific permissions.
- **Project Management:** Admins can create and manage projects, and assign members.
- **Task Management:** Kanban-style task board for tracking task statuses (Todo, In Progress, Done).
- **Dashboard:** At-a-glance metrics for tasks and projects.
- **Beautiful UI:** A sleek, dark-themed, glassmorphism-inspired premium UI.

## Tech Stack
- **Frontend:** React (Vite), React Router, Axios, Lucide React (Icons), Vanilla CSS
- **Backend:** Node.js, Express.js, JWT Authentication, bcryptjs
- **Database:** MongoDB with Mongoose

## How to Run Locally

### 1. Prerequisites
- Node.js installed
- MongoDB running locally or a MongoDB Atlas URI

### 2. Setup Backend
```bash
cd backend
npm install
```
- Create a `.env` file in the `backend` folder with the following:
  ```env
  MONGO_URL=mongodb://localhost:27017/team-task-manager
  PORT=5001
  JWT_SECRET=your_jwt_secret_here
  NODE_ENV=development
  ```
- Run the server:
  ```bash
  npm run start (or node server.js)
  ```

### 3. Setup Frontend
```bash
cd frontend
npm install
```
- Create a `.env` file in the `frontend` folder with the following:
  ```env
  VITE_API_URL=http://localhost:5001/api
  ```
- Run the frontend:
  ```bash
  npm run dev
  ```

## Deployment on Railway

1. **Database:** Deploy a MongoDB instance on Railway and copy the connection string.
2. **Backend:** Connect your GitHub repo to Railway, select the `backend` folder, and add the `MONGO_URL` and `JWT_SECRET` environment variables.
3. **Frontend:** Create a new service on Railway, select the `frontend` folder, set the build command to `npm run build`, and add `VITE_API_URL` pointing to your deployed backend.

## Roles
- **Admin:** Can create projects, assign members, add tasks, and modify anything.
- **Member:** Can only view assigned projects/tasks and change the status of their own tasks.
