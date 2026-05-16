import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  
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

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !editingTask) return;
    try {
      const { data } = await api.post(`/tasks/${editingTask._id}/comments`, { text: commentText });
      setEditingTask({ ...editingTask, comments: data });
      setCommentText('');
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to post comment');
    }
  };

  // Get available members for the selected project
  const selectedProject = projects.find(p => p._id === taskForm.projectId);
  const availableMembers = selectedProject ? selectedProject.teamMembers : [];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) return <div className="animate-fade-in p-8">Loading tasks...</div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">All Tasks</h2>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Input 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 bg-card/50"
          />
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-10 rounded-md border border-white/10 bg-card/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-white/10 bg-card/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Done</option>
          </select>

          {isAdmin && (
            <Button onClick={() => { setEditingTask(null); setShowTaskModal(true); }} className="gap-2 shrink-0">
              <Plus className="w-4 h-4" /> New Task
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-background/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Project</th>
                <th className="px-6 py-4 font-medium">Assigned To</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                {isAdmin && <th className="px-6 py-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTasks.map(task => (
                <tr key={task._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{task.title}</span>
                      {task.isOverdue && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">OVERDUE</Badge>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {task.projectId?.title || 'Unknown Project'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium">
                        {task.assignedTo?.name || 'Unassigned'}
                      </span>
                      {task.comments?.length > 0 && (
                        <span className="text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-white/10">
                          {task.comments.length} 💬
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    { (isAdmin || task.assignedTo?._id === user._id) ? (
                      <select 
                        value={task.status} 
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="h-7 text-xs rounded-md border border-white/10 bg-background px-2 focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="pending">Todo</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Done</option>
                      </select>
                    ) : (
                      <Badge variant={task.status === 'completed' ? 'default' : task.status === 'in-progress' ? 'secondary' : 'outline'}>
                        {task.status === 'pending' ? 'Todo' : task.status === 'in-progress' ? 'In Progress' : 'Done'}
                      </Badge>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-3 justify-end">
                        <Edit2 className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-primary transition-colors" onClick={() => openEditModal(task)} />
                        <Trash2 className="w-4 h-4 cursor-pointer text-destructive hover:text-destructive/80 transition-colors" onClick={() => handleDeleteTask(task._id)} />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center">
                    <h3 className="text-lg font-medium text-muted-foreground mb-1">No tasks found.</h3>
                    {isAdmin && <p className="text-sm text-muted-foreground">Click "New Task" to create one.</p>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showTaskModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-card/95 shadow-2xl border-white/10 max-h-[90vh] flex flex-col">
            <CardHeader>
              <CardTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <form onSubmit={handleTaskSubmit} className="space-y-4">
                {error && <div className="text-sm text-destructive">{error}</div>}
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input type="text" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea 
                    value={taskForm.description} 
                    onChange={e => setTaskForm({...taskForm, description: e.target.value})} 
                    rows="3" 
                    className="flex w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Project</Label>
                    <select 
                      value={taskForm.projectId} 
                      onChange={e => setTaskForm({...taskForm, projectId: e.target.value, assignedTo: ''})} 
                      required 
                      disabled={editingTask}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    >
                      <option value="">Select project...</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Assign To</Label>
                    <select 
                      value={taskForm.assignedTo} 
                      onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})} 
                      required 
                      disabled={!taskForm.projectId}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    >
                      <option value="">Select member...</option>
                      {availableMembers.map(m => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Status</Label>
                    <select 
                      value={taskForm.status} 
                      onChange={e => setTaskForm({...taskForm, status: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="pending">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Done</option>
                    </select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Priority</Label>
                    <select 
                      value={taskForm.priority} 
                      onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} min={!editingTask ? new Date().toISOString().split("T")[0] : undefined} className="bg-background/50" />
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-b border-white/10 pb-4">
                  <Button type="button" variant="outline" onClick={() => { setShowTaskModal(false); setEditingTask(null); }}>Cancel</Button>
                  <Button type="submit">{editingTask ? 'Update Task' : 'Create Task'}</Button>
                </div>
              </form>

              {/* Comments Section */}
              {editingTask && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground">Comments</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {editingTask.comments?.map((c, i) => (
                      <div key={i} className="bg-background/40 p-3 rounded-lg border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-primary">{c.user?.name || 'Unknown'}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs">{c.text}</p>
                      </div>
                    ))}
                    {(!editingTask.comments || editingTask.comments.length === 0) && (
                      <p className="text-xs text-muted-foreground italic">No comments yet.</p>
                    )}
                  </div>
                  <form onSubmit={handlePostComment} className="flex gap-2">
                    <Input 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Type a comment..." 
                      className="bg-background/50 h-9"
                    />
                    <Button type="submit" size="sm" disabled={!commentText.trim()}>Post</Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Tasks;
