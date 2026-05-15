import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', members: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
    if (user.role === 'admin') {
      fetchUsers();
    }
  }, [user.role]);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      // Only members can be added to projects
      setUsers(data.filter(u => u.role === 'member'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // 1. Create project with title & description
      const projRes = await api.post('/projects', { title: newProject.title, description: newProject.description });
      
      // 2. Add members if any were selected
      if (newProject.members.length > 0) {
        await api.post(`/projects/${projRes.data._id}/members`, { members: newProject.members });
      }

      setShowModal(false);
      setNewProject({ title: '', description: '', members: [] });
      fetchProjects();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleMemberChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setNewProject({ ...newProject, members: selectedOptions });
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Projects</h2>
        {user.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {projects.map(proj => (
          <div key={proj._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>
              <Link to={`/projects/${proj._id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>{proj.title}</Link>
            </h3>
            <p style={{ flex: 1, fontSize: '0.9rem', marginBottom: '1.5rem' }}>{proj.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{proj.teamMembers?.length || 0} Members</span>
              <Link to={`/projects/${proj._id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>View Details</Link>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
            <h3 style={{ color: 'var(--text-muted)' }}>No projects found.</h3>
            {user.role === 'admin' && <p style={{ color: 'var(--text-muted)' }}>Click "New Project" to get started.</p>}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Create New Project</h3>
            {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Title</label>
                <input type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Description</label>
                <textarea value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} rows="3" />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label>Assign Members (Hold Ctrl/Cmd to select multiple)</label>
                <select multiple value={newProject.members} onChange={handleMemberChange} style={{ height: '100px' }}>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
