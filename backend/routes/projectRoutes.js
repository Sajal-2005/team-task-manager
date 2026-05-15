const express = require('express');
const { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject,
  addMembers,
  removeMember
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('admin'), createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorize('admin'), updateProject)
  .delete(protect, authorize('admin'), deleteProject);

router.route('/:id/members')
  .post(protect, authorize('admin'), addMembers);

router.route('/:id/members/:userId')
  .delete(protect, authorize('admin'), removeMember);

module.exports = router;
