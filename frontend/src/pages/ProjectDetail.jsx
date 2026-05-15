import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Plus, Trash2, Edit2, UserPlus, X } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'Medium',
    dueDate: '',
    assignedTo: ''
  });

  const [editProjectMode, setEditProjectMode] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: '', description: '' });
  
  const [memberToAdd, setMemberToAdd] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchProject();
    fetchTasks();
    if (isAdmin) {
      fetchUsers();
    }
  }, [id, isAdmin]);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
      setProjectForm({ title: data.title, description: data.description });
    } catch (err) {
      console.error(err);
      navigate('/projects');
    }
  };

  const fetchTasks = async () => {
    try {
      const { data } = await api.get(`/tasks?projectId=${id}`);
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setAllUsers(data.filter(u => u.role === 'member'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProject = async () => {
    try {
      await api.put(`/projects/${id}`, projectForm);
      setEditProjectMode(false);
      fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        navigate('/projects');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddMember = async () => {
    if (!memberToAdd) return;
    try {
      await api.post(`/projects/${id}/members`, { members: [memberToAdd] });
      setMemberToAdd('');
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
      console.error(err);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Remove this member from the project?')) {
      try {
        await api.delete(`/projects/${id}/members/${userId}`);
        fetchProject();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, taskForm);
      } else {
        await api.post('/tasks', { ...taskForm, projectId: id });
      }
      setShowTaskModal(false);
      setEditingTask(null);
      setTaskForm({ title: '', description: '', status: 'pending', priority: 'Medium', dueDate: '', assignedTo: '' });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
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
    if (window.confirm('Delete this task?')) {
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
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo?._id || ''
    });
    setShowTaskModal(true);
  };

  if (!project) return <div>Loading project...</div>;

  const renderColumn = (title, statusValue) => {
    const columnTasks = tasks.filter(t => t.status === statusValue);
    
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <span className="badge" style={{ background: 'var(--glass-border)' }}>{columnTasks.length}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          {columnTasks.map(task => (
            <div key={task._id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', border: `1px solid ${task.isOverdue ? 'rgba(239, 68, 68, 0.5)' : 'var(--glass-border)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
                  {task.title}
                  {task.isOverdue && <span style={{ color: 'var(--danger)', fontSize: '0.7rem', marginLeft: '0.5rem' }}>OVERDUE</span>}
                </h4>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Edit2 size={14} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => openEditModal(task)} />
                    <Trash2 size={14} style={{ cursor: 'pointer', color: 'var(--danger)' }} onClick={() => handleDeleteTask(task._id)} />
                  </div>
                )}
              </div>
              {task.description && <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>{task.description}</p>}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {task.assignedTo?.name || 'Unassigned'}
                </span>
                
                {/* Status Dropdown (Members can change their own tasks, Admins can change any) */}
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
              </div>
            </div>
          ))}
          {columnTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              No tasks
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, marginRight: '2rem' }}>
            {editProjectMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
                <input 
                  type="text" 
                  value={projectForm.title} 
                  onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                  style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
                />
                <textarea 
                  value={projectForm.description} 
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                  rows="3"
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" onClick={handleUpdateProject}>Save</button>
                  <button className="btn btn-outline" onClick={() => { setEditProjectMode(false); setProjectForm({ title: project.title, description: project.description }); }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {project.title}
                  {isAdmin && <Edit2 size={18} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setEditProjectMode(true)} />}
                </h2>
                <p style={{ fontSize: '1.1rem', maxWidth: '800px' }}>{project.description}</p>
              </>
            )}
          </div>
          
          {isAdmin && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => { setEditingTask(null); setShowTaskModal(true); }}>
                <Plus size={18} /> Add Task
              </button>
              <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={handleDeleteProject}>
                <Trash2 size={18} /> Delete Project
              </button>
            </div>
          )}
        </div>
        
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 500 }}>Team Members ({project.teamMembers?.length || 0})</span>
            {isAdmin && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select value={memberToAdd} onChange={(e) => setMemberToAdd(e.target.value)} style={{ width: '200px', marginBottom: 0, padding: '0.4rem' }}>
                  <option value="">Select member...</option>
                  {allUsers.filter(u => !project.teamMembers.find(m => m._id === u._id)).map(u => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
                <button className="btn btn-outline" onClick={handleAddMember} disabled={!memberToAdd} style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserPlus size={16} /> Add
                </button>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {project.teamMembers?.map(m => (
              <span key={m._id} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {m.name}
                {isAdmin && <X size={14} style={{ cursor: 'pointer', color: 'var(--danger)' }} onClick={() => handleRemoveMember(m._id)} />}
              </span>
            ))}
            {project.teamMembers?.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No members added yet.</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {renderColumn('To Do', 'pending')}
        {renderColumn('In Progress', 'in-progress')}
        {renderColumn('Done', 'completed')}
      </div>

      {showTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
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
                  <label>Status</label>
                  <select value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                    <option value="pending">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Done</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Due Date</label>
                <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} min={!editingTask ? new Date().toISOString().split("T")[0] : undefined} />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label>Assign To (Members Only)</label>
                <select value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})} required>
                  <option value="">Select a member...</option>
                  {project.teamMembers.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
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

export default ProjectDetail;
