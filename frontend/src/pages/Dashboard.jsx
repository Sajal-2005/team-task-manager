import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Layout, AlertCircle, TrendingUp, Users, List, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="animate-fade-in p-8">Loading dashboard...</div>;
  if (error) return <div className="animate-fade-in p-8 text-destructive">{error}</div>;

  const isAdmin = user?.role === 'admin';
  
  // Destructure values safely
  const projectsCount = isAdmin ? stats.totalProjects : stats.assignedProjectsCount;
  const teamMembersCount = isAdmin ? stats.totalTeamMembers : null;
  const totalTasksCount = isAdmin ? stats.totalTasks : stats.assignedTasksCount;
  
  const pendingCount = isAdmin ? stats.pendingTasksCount : stats.pendingAssignedTasksCount;
  const inProgressCount = isAdmin ? stats.inProgressTasksCount : stats.inProgressAssignedTasksCount;
  const doneCount = isAdmin ? stats.completedTasksCount : stats.completedAssignedTasksCount;
  const overdueCount = isAdmin ? stats.overdueTasksCount : stats.overdueAssignedTasksCount;
  
  const upcomingTasks = isAdmin ? stats.upcomingTasks : stats.upcomingAssignedTasks;
  const recentTasks = isAdmin ? stats.recentTasks : null;
  const progress = isAdmin ? null : stats.personalProgress; 

  const StatCard = ({ title, value, icon, iconColorClass, bgColorClass }) => (
    <Card className="border-white/10 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bgColorClass}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-3xl font-bold">{value}</h3>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );

  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'completed': return 'default'; // primary color
      case 'in-progress': return 'secondary'; // secondary color
      case 'pending': return 'outline'; // bordered
      default: return 'outline';
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h2>
        <p className="text-muted-foreground mt-2">Here's your {isAdmin ? 'administrative ' : ''}overview for today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        <StatCard title={isAdmin ? "Total Projects" : "Assigned Projects"} value={projectsCount} icon={<Layout className="w-6 h-6 text-blue-400" />} bgColorClass="bg-blue-500/10" />
        {isAdmin && <StatCard title="Team Members" value={teamMembersCount} icon={<Users className="w-6 h-6 text-purple-400" />} bgColorClass="bg-purple-500/10" />}
        <StatCard title={isAdmin ? "Total Tasks" : "Assigned Tasks"} value={totalTasksCount} icon={<List className="w-6 h-6 text-fuchsia-400" />} bgColorClass="bg-fuchsia-500/10" />
        
        <StatCard title="Pending" value={pendingCount} icon={<Clock className="w-6 h-6 text-slate-400" />} bgColorClass="bg-slate-500/10" />
        <StatCard title="In Progress" value={inProgressCount} icon={<PlayCircle className="w-6 h-6 text-amber-400" />} bgColorClass="bg-amber-500/10" />
        <StatCard title="Completed" value={doneCount} icon={<CheckCircle className="w-6 h-6 text-emerald-400" />} bgColorClass="bg-emerald-500/10" />
        <StatCard title="Overdue" value={overdueCount} icon={<AlertCircle className="w-6 h-6 text-red-400" />} bgColorClass="bg-red-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Admin Project Progress or Member Personal Progress */}
        <Card className="border-white/10 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">{isAdmin ? 'Project Progress' : 'Personal Progress'}</CardTitle>
            {isAdmin && <Link to="/projects" className="text-sm font-medium text-primary hover:underline">View Projects</Link>}
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 mt-4">
              {isAdmin ? (
                stats.projectProgress?.length > 0 ? (
                  stats.projectProgress.slice(0, 5).map(proj => (
                    <div key={proj.projectId} className="p-4 rounded-lg bg-background/50 border border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <Link to={`/projects/${proj.projectId}`} className="font-semibold hover:underline">{proj.title}</Link>
                        <span className="text-sm font-medium">{proj.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${proj.progress}%` }}></div>
                      </div>
                    </div>
                  ))
                ) : <p className="text-muted-foreground text-sm">No projects found.</p>
              ) : (
                <div className="py-12 text-center">
                  <TrendingUp className="w-16 h-16 text-primary/80 mx-auto mb-4" />
                  <h2 className="text-5xl font-bold tracking-tighter mb-2">{progress}%</h2>
                  <p className="text-muted-foreground font-medium">of your assigned tasks are completed</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Recent Tasks (Admin) / Upcoming Tasks */}
        <div className="space-y-6">
          {isAdmin && (
            <Card className="border-white/10 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Recent Tasks</CardTitle>
                <Link to="/tasks" className="text-sm font-medium text-primary hover:underline">View All</Link>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 mt-4">
                  {recentTasks?.length > 0 ? (
                    recentTasks.map(task => (
                      <div key={task._id} className="p-4 rounded-lg bg-background/50 border border-white/5 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                          <p className="text-xs text-muted-foreground">Project: {task.projectId?.title}</p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(task.status)} className="capitalize">
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    ))
                  ) : <p className="text-muted-foreground text-sm">No recent tasks found.</p>}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-white/10 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Upcoming Due Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 mt-4">
                {upcomingTasks?.length > 0 ? (
                  upcomingTasks.map(task => (
                    <div key={task._id} className="p-4 rounded-lg bg-background/50 border border-white/5 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                        <p className="text-xs text-muted-foreground">Project: {task.projectId?.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(task.status)} className="capitalize">
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  ))
                ) : <p className="text-muted-foreground text-sm">No upcoming tasks found.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
