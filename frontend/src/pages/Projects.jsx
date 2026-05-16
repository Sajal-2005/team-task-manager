import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

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
      const projRes = await api.post('/projects', { title: newProject.title, description: newProject.description });
      
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
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
        {user.role === 'admin' && (
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(proj => (
          <Card key={proj._id} className="flex flex-col bg-card/50 backdrop-blur-sm border-white/10 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle>
                <Link to={`/projects/${proj._id}`} className="hover:underline">{proj.title}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription className="text-sm">
                {proj.description || 'No description provided.'}
              </CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t border-white/5 pt-4">
              <span className="text-xs text-muted-foreground font-medium">{proj.teamMembers?.length || 0} Members</span>
              <Link to={`/projects/${proj._id}`}>
                <Button variant="outline" size="sm">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
        
        {projects.length === 0 && (
          <div className="col-span-full py-16 text-center bg-background/50 rounded-xl border border-dashed border-white/20">
            <h3 className="text-lg font-medium text-muted-foreground mb-1">No projects found.</h3>
            {user.role === 'admin' && <p className="text-sm text-muted-foreground">Click "New Project" to get started.</p>}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-card/95 shadow-2xl border-white/10">
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
              <CardDescription>Add a new project to your workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              {error && <div className="text-sm text-destructive mb-4">{error}</div>}
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <textarea 
                    id="desc"
                    value={newProject.description} 
                    onChange={e => setNewProject({...newProject, description: e.target.value})} 
                    rows="3" 
                    className="flex min-h-[80px] w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="members">Assign Members (Hold Ctrl/Cmd to select multiple)</Label>
                  <select 
                    id="members"
                    multiple 
                    value={newProject.members} 
                    onChange={handleMemberChange} 
                    className="flex h-32 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {users.map(u => (
                      <option key={u._id} value={u._id} className="py-1">{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Projects;
