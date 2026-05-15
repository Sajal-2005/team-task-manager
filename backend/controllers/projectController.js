const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find({}).populate('teamMembers', 'name email');
    } else {
      projects = await Project.find({ teamMembers: req.user.id }).populate('teamMembers', 'name email');
    }
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('teamMembers', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (req.user.role !== 'admin' && !project.teamMembers.some(m => m._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Project title is required' });
    }

    const project = await Project.create({
      title,
      description,
      createdBy: req.user.id,
      teamMembers: []
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
exports.updateProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (title) project.title = title;
    if (description !== undefined) project.description = description;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete associated tasks
    await Task.deleteMany({ projectId: req.params.id });
    
    await Project.deleteOne({ _id: req.params.id });

    res.json({ message: 'Project removed' });
  } catch (error) {
    next(error);
  }
};

const User = require('../models/User'); // Required for fetching user role

// @desc    Add member(s) to project
// @route   POST /api/projects/:id/members
// @access  Private/Admin
exports.addMembers = async (req, res, next) => {
  try {
    const { members } = req.body; // Expecting an array of user IDs
    
    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of member IDs' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const validMembers = [];
    for (const userId of members) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ message: `User not found: ${userId}` });
      }
      if (user.role !== 'member') {
        return res.status(400).json({ message: `User ${userId} is not a member` });
      }
      if (project.teamMembers.includes(userId)) {
        return res.status(400).json({ message: `User ${userId} is already in the project` });
      }
      validMembers.push(userId);
    }

    project.teamMembers.push(...validMembers);
    await project.save();

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private/Admin
exports.removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const memberIndex = project.teamMembers.indexOf(req.params.userId);
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'User is not a member of this project' });
    }

    project.teamMembers.splice(memberIndex, 1);
    await project.save();

    res.json(project);
  } catch (error) {
    next(error);
  }
};
