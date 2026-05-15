const express = require('express');
const { 
  getTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask 
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getTasks)
  .post(protect, authorize('admin'), createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask) // Internal logic handles Admin vs Member permissions
  .delete(protect, authorize('admin'), deleteTask);

module.exports = router;
