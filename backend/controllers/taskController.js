const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    let query = {};
    
    if (projectId) {
      query.projectId = projectId;
    }

    if (req.user.role !== 'admin') {
      query.assignedTo = req.user.id;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('comments.user', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('comments.user', 'name email');
      
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private/Admin
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, projectId, assignedTo } = req.body;

    if (!title || !projectId || !assignedTo) {
      return res.status(400).json({ message: 'Title, projectId, and assignedTo are required' });
    }

    const proj = await Project.findById(projectId);
    if (!proj) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const User = require('../models/User');
    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(404).json({ message: 'Assigned user not found' });
    }
    if (user.role !== 'member') {
      return res.status(400).json({ message: 'Assigned user must be a member' });
    }
    if (!proj.teamMembers.includes(assignedTo)) {
      return res.status(400).json({ message: 'Assigned user must belong to the selected project team' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assignedTo,
      createdBy: req.user.id
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'admin') {
      const { title, description, status, priority, dueDate, assignedTo } = req.body;
      
      if (assignedTo && assignedTo !== task.assignedTo.toString()) {
        const User = require('../models/User');
        const user = await User.findById(assignedTo);
        if (!user) return res.status(404).json({ message: 'Assigned user not found' });
        if (user.role !== 'member') return res.status(400).json({ message: 'Assigned user must be a member' });
        
        const proj = await Project.findById(task.projectId);
        if (!proj.teamMembers.includes(assignedTo)) {
          return res.status(400).json({ message: 'Assigned user must belong to the selected project team' });
        }
        task.assignedTo = assignedTo;
      }

      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate) task.dueDate = dueDate;
    } else {
      // Members can only update status
      if (task.assignedTo.toString() !== req.user.id) {
         return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      const { status } = req.body;
      if (status) task.status = status;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.deleteOne({ _id: req.params.id });
    res.json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Admins or the assigned user or team members can comment
    // Simplest logic: if they can see the task, they can comment.
    // getTaskById already checks visibility, but here we just check if they are member of project or admin
    if (req.user.role !== 'admin') {
      const proj = await Project.findById(task.projectId);
      if (!proj.teamMembers.includes(req.user.id)) {
        return res.status(403).json({ message: 'Not authorized to comment on this task' });
      }
    }

    const comment = {
      text,
      user: req.user.id
    };

    task.comments.push(comment);
    await task.save();

    // Re-fetch to populate the user info
    const updatedTask = await Task.findById(task._id).populate('comments.user', 'name email');
    res.status(201).json(updatedTask.comments);
  } catch (error) {
    next(error);
  }
};
