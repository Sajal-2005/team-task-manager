import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Layout, AlertCircle, TrendingUp, Users, List, PlayCircle } from 'lucide-react';

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

  if (loading) return <div className="animate-fade-in">Loading dashboard...</div>;
  if (error) return <div className="animate-fade-in" style={{color: 'var(--danger)'}}>{error}</div>;

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

  const Card = ({ title, value, icon, color }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ padding: '1rem', background: `rgba(${color}, 0.2)`, borderRadius: '12px' }}>
        {icon}
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{value}</h3>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>{title}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Welcome, {user?.name}!</h2>
        <p>Here's your {isAdmin ? 'administrative ' : ''}overview for today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <Card title={isAdmin ? "Total Projects" : "Assigned Projects"} value={projectsCount} icon={<Layout color="#93c5fd" size={24} />} color="59, 130, 246" />
        {isAdmin && <Card title="Team Members" value={teamMembersCount} icon={<Users color="#c4b5fd" size={24} />} color="139, 92, 246" />}
        <Card title={isAdmin ? "Total Tasks" : "Assigned Tasks"} value={totalTasksCount} icon={<List color="#d8b4fe" size={24} />} color="168, 85, 247" />
        
        <Card title="Pending" value={pendingCount} icon={<Clock color="#cbd5e1" size={24} />} color="148, 163, 184" />
        <Card title="In Progress" value={inProgressCount} icon={<PlayCircle color="#fcd34d" size={24} />} color="245, 158, 11" />
        <Card title="Completed" value={doneCount} icon={<CheckCircle color="#6ee7b7" size={24} />} color="16, 185, 129" />
        <Card title="Overdue" value={overdueCount} icon={<AlertCircle color="#fca5a5" size={24} />} color="239, 68, 68" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Admin Project Progress or Member Personal Progress */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>{isAdmin ? 'Project Progress' : 'Personal Progress'}</h3>
            {isAdmin && <Link to="/projects" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}>View Projects</Link>}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isAdmin ? (
              stats.projectProgress?.length > 0 ? (
                stats.projectProgress.slice(0, 5).map(proj => (
                  <div key={proj.projectId} style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <Link to={`/projects/${proj.projectId}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>{proj.title}</Link>
                      <span style={{ fontSize: '0.85rem' }}>{proj.progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--glass-border)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${proj.progress}%`, background: 'var(--primary)', transition: 'width 0.5s ease' }}></div>
                    </div>
                  </div>
                ))
              ) : <p>No projects found.</p>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <TrendingUp size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
                <h2 style={{ fontSize: '3rem', margin: '0 0 0.5rem 0' }}>{progress}%</h2>
                <p style={{ color: 'var(--text-muted)' }}>of your assigned tasks are completed</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Tasks (Admin) / Upcoming Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {isAdmin && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Recent Tasks</h3>
                <Link to="/tasks" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}>View All</Link>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentTasks?.length > 0 ? (
                  recentTasks.map(task => (
                    <div key={task._id} style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{task.title}</h4>
                        <p style={{ fontSize: '0.8rem', margin: 0 }}>Project: {task.projectId?.title}</p>
                      </div>
                      <span className={`badge ${task.status === 'completed' ? 'badge-done' : task.status === 'in-progress' ? 'badge-progress' : 'badge-todo'}`}>
                        {task.status}
                      </span>
                    </div>
                  ))
                ) : <p>No recent tasks found.</p>}
              </div>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Upcoming Due Tasks</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingTasks?.length > 0 ? (
                upcomingTasks.map(task => (
                  <div key={task._id} style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{task.title}</h4>
                      <p style={{ fontSize: '0.8rem', margin: 0 }}>Project: {task.projectId?.title}</p>
                      <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <span className={`badge ${task.status === 'completed' ? 'badge-done' : task.status === 'in-progress' ? 'badge-progress' : 'badge-todo'}`}>
                      {task.status}
                    </span>
                  </div>
                ))
              ) : <p>No upcoming tasks found.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
