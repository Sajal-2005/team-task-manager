import React, { useState, useEffect, useContext } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Plus, Trash2, Edit2, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  const [commentText, setCommentText] = useState('');

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

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const draggedTask = tasks.find(t => t._id === draggableId);
    
    if (!isAdmin && draggedTask.assignedTo?._id !== user._id) {
       alert("You are not authorized to move this task.");
       return;
    }

    // Optimistically update
    setTasks(prevTasks => prevTasks.map(t => t._id === draggableId ? { ...t, status: newStatus } : t));

    try {
      await api.put(`/tasks/${draggableId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
      fetchTasks(); // Revert
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

  if (!project) return <div className="p-8">Loading project...</div>;

  const renderColumn = (title, statusValue) => {
    const columnTasks = tasks.filter(t => t.status === statusValue);
    
    return (
      <Card className="flex flex-col bg-card/50 backdrop-blur-sm border-white/10 min-h-[400px]">
        <CardHeader className="pb-3 border-b border-white/5 mb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant="secondary">{columnTasks.length}</Badge>
          </div>
        </CardHeader>
        
        <Droppable droppableId={statusValue}>
          {(provided, snapshot) => (
            <CardContent 
              className={`flex flex-col gap-4 flex-1 pb-8 ${snapshot.isDraggingOver ? 'bg-primary/5 rounded-b-lg' : ''} transition-colors`}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {columnTasks.map((task, index) => (
                <Draggable key={task._id} draggableId={task._id} index={index} isDragDisabled={!isAdmin && task.assignedTo?._id !== user._id}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-4 rounded-xl bg-background/80 border ${task.isOverdue ? 'border-destructive/50' : 'border-white/5'} ${snapshot.isDragging ? 'shadow-lg shadow-primary/20 ring-1 ring-primary' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className="font-semibold text-sm leading-tight flex-1">
                          {task.title}
                          {task.isOverdue && <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0">OVERDUE</Badge>}
                        </h4>
                        <div className="flex gap-2 shrink-0">
                          <Edit2 className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-primary transition-colors" onClick={() => openEditModal(task)} />
                          {isAdmin && <Trash2 className="w-4 h-4 cursor-pointer text-destructive hover:text-destructive/80 transition-colors" onClick={() => handleDeleteTask(task._id)} />}
                        </div>
                      </div>
                      {task.description && <p className="text-xs text-muted-foreground mb-4 line-clamp-3">{task.description}</p>}
                      
                      <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                            {task.assignedTo?.name || 'Unassigned'}
                          </span>
                          {task.comments?.length > 0 && (
                            <span className="text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-white/10">
                              {task.comments.length} 💬
                            </span>
                          )}
                        </div>
                        <Badge variant={task.status === 'completed' ? 'default' : task.status === 'in-progress' ? 'secondary' : 'outline'}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-white/10 rounded-xl">
                  Drop tasks here
                </div>
              )}
            </CardContent>
          )}
        </Droppable>
      </Card>
    );
  };

  return (
    <div className="animate-fade-in space-y-8">
      <Card className="bg-card/50 backdrop-blur-sm border-white/10">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1 w-full">
              {editProjectMode ? (
                <div className="space-y-4 max-w-2xl">
                  <Input 
                    type="text" 
                    value={projectForm.title} 
                    onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                    className="text-2xl font-bold h-14 bg-background/50 border-white/10"
                  />
                  <textarea 
                    value={projectForm.description} 
                    onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                    rows="3"
                    className="flex w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateProject}>Save</Button>
                    <Button variant="outline" onClick={() => { setEditProjectMode(false); setProjectForm({ title: project.title, description: project.description }); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                    {project.title}
                    {isAdmin && <Edit2 className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-primary transition-colors" onClick={() => setEditProjectMode(true)} />}
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-3xl">{project.description}</p>
                </>
              )}
            </div>
            
            {isAdmin && (
              <div className="flex gap-3 flex-wrap justify-start md:justify-end shrink-0">
                <Button onClick={() => { setEditingTask(null); setShowTaskModal(true); }} className="gap-2">
                  <Plus className="w-4 h-4" /> Add Task
                </Button>
                <Button variant="destructive" onClick={handleDeleteProject} className="gap-2">
                  <Trash2 className="w-4 h-4" /> Delete Project
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <span className="font-semibold text-lg">Team Members ({project.teamMembers?.length || 0})</span>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <select 
                    value={memberToAdd} 
                    onChange={(e) => setMemberToAdd(e.target.value)} 
                    className="h-9 w-48 rounded-md border border-white/10 bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select member...</option>
                    {allUsers.filter(u => !project.teamMembers.find(m => m._id === u._id)).map(u => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm" onClick={handleAddMember} disabled={!memberToAdd} className="gap-2">
                    <UserPlus className="w-4 h-4" /> Add
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {project.teamMembers?.map(m => (
                <Badge key={m._id} variant="secondary" className="px-3 py-1.5 text-sm gap-2">
                  {m.name}
                  {isAdmin && <X className="w-3.5 h-3.5 cursor-pointer text-muted-foreground hover:text-destructive transition-colors" onClick={() => handleRemoveMember(m._id)} />}
                </Badge>
              ))}
              {project.teamMembers?.length === 0 && <span className="text-sm text-muted-foreground">No members added yet.</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderColumn('To Do', 'pending')}
          {renderColumn('In Progress', 'in-progress')}
          {renderColumn('Done', 'completed')}
        </div>
      </DragDropContext>

      {showTaskModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-card/95 shadow-2xl border-white/10 max-h-[90vh] flex flex-col">
            <CardHeader>
              <CardTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <form onSubmit={handleTaskSubmit} className="space-y-4">
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
                <div className="space-y-2">
                  <Label>Assign To (Members Only)</Label>
                  <select 
                    value={taskForm.assignedTo} 
                    onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})} 
                    required
                    className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a member...</option>
                    {project.teamMembers.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
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

export default ProjectDetail;
