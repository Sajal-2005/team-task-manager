const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (req.user.role === 'admin') {
      // Admin Dashboard Data
      const totalProjects = await Project.countDocuments();
      const totalTeamMembers = await User.countDocuments({ role: 'member' });
      
      const tasks = await Task.find({});
      const totalTasks = tasks.length;
      
      let pending = 0;
      let inProgress = 0;
      let completed = 0;
      let overdue = 0;

      tasks.forEach(task => {
        if (task.status === 'pending') pending++;
        if (task.status === 'in-progress') inProgress++;
        if (task.status === 'completed') completed++;
        
        if (task.dueDate && task.dueDate < today && task.status !== 'completed') {
          overdue++;
        }
      });

      // Project-wise progress percentage
      const projects = await Project.find({});
      const projectProgress = await Promise.all(projects.map(async (project) => {
        const projectTasks = tasks.filter(t => t.projectId.toString() === project._id.toString());
        const projTotalTasks = projectTasks.length;
        const projCompletedTasks = projectTasks.filter(t => t.status === 'completed').length;
        const percentage = projTotalTasks === 0 ? 0 : Math.round((projCompletedTasks / projTotalTasks) * 100);
        
        return {
          projectId: project._id,
          title: project.title,
          progress: percentage,
          totalTasks: projTotalTasks,
          completedTasks: projCompletedTasks
        };
      }));

      const recentTasks = await Task.find({}).sort({ createdAt: -1 }).limit(5).populate('assignedTo', 'name email').populate('projectId', 'title');
      const upcomingTasks = await Task.find({ 
        status: { $ne: 'completed' }, 
        dueDate: { $gte: today } 
      }).sort({ dueDate: 1 }).limit(5).populate('assignedTo', 'name email').populate('projectId', 'title');

      return res.json({
        totalProjects,
        totalTeamMembers,
        totalTasks,
        pendingTasksCount: pending,
        inProgressTasksCount: inProgress,
        completedTasksCount: completed,
        overdueTasksCount: overdue,
        projectProgress,
        recentTasks,
        upcomingTasks
      });

    } else {
      // Member Dashboard Data
      const assignedProjectsCount = await Project.countDocuments({ teamMembers: req.user.id });
      
      const tasks = await Task.find({ assignedTo: req.user.id });
      const assignedTasksCount = tasks.length;

      let pending = 0;
      let inProgress = 0;
      let completed = 0;
      let overdue = 0;

      tasks.forEach(task => {
        if (task.status === 'pending') pending++;
        if (task.status === 'in-progress') inProgress++;
        if (task.status === 'completed') completed++;
        
        if (task.dueDate && task.dueDate < today && task.status !== 'completed') {
          overdue++;
        }
      });

      const personalProgress = assignedTasksCount === 0 ? 0 : Math.round((completed / assignedTasksCount) * 100);

      const upcomingTasks = await Task.find({ 
        assignedTo: req.user.id,
        status: { $ne: 'completed' }, 
        dueDate: { $gte: today } 
      }).sort({ dueDate: 1 }).limit(5).populate('projectId', 'title');

      return res.json({
        assignedProjectsCount,
        assignedTasksCount,
        pendingAssignedTasksCount: pending,
        inProgressAssignedTasksCount: inProgress,
        completedAssignedTasksCount: completed,
        overdueAssignedTasksCount: overdue,
        upcomingAssignedTasks: upcomingTasks,
        personalProgress
      });
    }

  } catch (error) {
    next(error);
  }
};
