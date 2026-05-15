import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Plus, Trash2, Edit2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState('');
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'Medium',
    dueDate: '',
    projectId: '',
    assignedTo: ''
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchTasks();
    if (isAdmin) {
      fetchProjects();
    }
  }, [isAdmin]);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, taskForm);
      } else {
        await api.post('/tasks', taskForm);
      }
      setShowTaskModal(false);
      setEditingTask(null);
      setTaskForm({ title: '', description: '', status: 'pending', priority: 'Medium', dueDate: '', projectId: '', assignedTo: '' });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task globally?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority || 'Medium',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      projectId: task.projectId?._id || '',
      assignedTo: task.assignedTo?._id || ''
    });
    setShowTaskModal(true);
  };

  // Get available members for the selected project
  const selectedProject = projects.find(p => p._id === taskForm.projectId);
  const availableMembers = selectedProject ? selectedProject.teamMembers : [];

  if (loading) return <div className="animate-fade-in">Loading tasks...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>All Tasks</h2>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowTaskModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> New Task
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Title</th>
              <th style={{ padding: '1rem' }}>Project</th>
              <th style={{ padding: '1rem' }}>Assigned To</th>
              <th style={{ padding: '1rem' }}>Due Date</th>
              <th style={{ padding: '1rem' }}>Status</th>
              {isAdmin && <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 500 }}>{task.title}</span>
                    {task.isOverdue && <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}>Overdue</span>}
                  </div>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {task.projectId?.title || 'Unknown Project'}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                  {task.assignedTo?.name || 'Unassigned'}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                </td>
                <td style={{ padding: '1rem' }}>
                  { (isAdmin || task.assignedTo?._id === user._id) ? (
                    <select 
                      value={task.status} 
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.75rem', marginBottom: 0, height: 'auto', borderRadius: '4px' }}
                    >
                      <option value="pending">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Done</option>
                    </select>
                  ) : (
                    <span className={`badge ${task.status === 'completed' ? 'badge-done' : task.status === 'in-progress' ? 'badge-progress' : 'badge-todo'}`}>
                      {task.status === 'pending' ? 'Todo' : task.status === 'in-progress' ? 'In Progress' : 'Done'}
                    </span>
                  )}
                </td>
                {isAdmin && (
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <Edit2 size={16} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => openEditModal(task)} />
                      <Trash2 size={16} style={{ cursor: 'pointer', color: 'var(--danger)' }} onClick={() => handleDeleteTask(task._id)} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} style={{ padding: '3rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)' }}>
                  <h3 style={{ color: 'var(--text-muted)' }}>No tasks found.</h3>
                  {isAdmin && <p style={{ color: 'var(--text-muted)' }}>Click "New Task" to create one.</p>}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
            {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
            <form onSubmit={handleTaskSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Title</label>
                <input type="text" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} rows="3" />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Project</label>
                  <select value={taskForm.projectId} onChange={e => {
                    setTaskForm({...taskForm, projectId: e.target.value, assignedTo: ''}); // Reset assignee when project changes
                  }} required disabled={editingTask}>
                    <option value="">Select a project...</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label>Assign To</label>
                  <select value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})} required disabled={!taskForm.projectId}>
                    <option value="">Select a member...</option>
                    {availableMembers.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Status</label>
                  <select value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                    <option value="pending">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Done</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label>Due Date</label>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} min={!editingTask ? new Date().toISOString().split("T")[0] : undefined} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => { setShowTaskModal(false); setEditingTask(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTask ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
