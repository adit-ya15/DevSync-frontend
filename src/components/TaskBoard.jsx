import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { taskAPI } from '../utils/taskAPI';
import defaultAvatar from '../assests/images/default-user-image.png';
import './TaskBoard.css';

const TaskBoard = ({ projectId, members }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: ''
  });

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await taskAPI.getTasks(projectId);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks', error);
      toast.error('Failed to load project tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');

    try {
      const newTask = await taskAPI.createTask(projectId, {
        ...form,
        assignee: form.assignee || null
      });
      setTasks([newTask, ...tasks]);
      setShowForm(false);
      setForm({ title: '', description: '', status: 'todo', priority: 'medium', assignee: '' });
      toast.success('Task created');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic update
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

    try {
      await taskAPI.updateTask(projectId, taskId, { status: newStatus });
    } catch (error) {
      setTasks(previousTasks);
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.deleteTask(projectId, taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  // Drag and Drop Logic
  const handleDragStart = (e, task) => {
    setDraggedItem(task);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to prevent the dragged element from disappearing
    setTimeout(() => { e.target.style.opacity = '0.5'; }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    document.querySelectorAll('.tb-column').forEach(c => c.classList.remove('drag-over'));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (draggedItem && draggedItem.status !== targetStatus) {
      handleStatusChange(draggedItem._id, targetStatus);
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ];

  if (loading) return <div className="tb-loading"><span className="profile-spinner"></span></div>;

  return (
    <div className="task-board-container animate-fade-in">
      
      <div className="tb-header">
        <h3 className="tb-title">Project Tasks</h3>
        <button className="tb-add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {showForm && (
        <form className="tb-form-wrap animate-fade-in" onSubmit={handleCreateTask}>
          <div className="tb-form-row">
            <input 
              className="cp-input" 
              name="title" 
              placeholder="Task Title*" 
              value={form.title} 
              onChange={handleInputChange} 
              autoFocus
            />
          </div>
          <div className="tb-form-row">
            <textarea 
              className="cp-input" 
              name="description" 
              placeholder="Description (Optional)" 
              rows="2" 
              value={form.description} 
              onChange={handleInputChange} 
            />
          </div>
          <div className="tb-form-row">
            <select className="cp-input" name="priority" value={form.priority} onChange={handleInputChange}>
              <option value="low">Priority: Low</option>
              <option value="medium">Priority: Medium</option>
              <option value="high">Priority: High</option>
            </select>
            <select className="cp-input" name="status" value={form.status} onChange={handleInputChange}>
              <option value="todo">Status: To Do</option>
              <option value="in-progress">Status: In Progress</option>
              <option value="done">Status: Done</option>
            </select>
            <select className="cp-input" name="assignee" value={form.assignee} onChange={handleInputChange}>
              <option value="">Assign to (Unassigned)</option>
              {members?.map(m => m.user && (
                <option key={m.user._id} value={m.user._id}>{m.user.firstName} {m.user.lastName}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="cp-btn cp-btn-save" style={{padding: '6px 16px'}}>Add Task</button>
        </form>
      )}

      <div className="tb-columns">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div 
              key={col.id} 
              className="tb-column"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="tb-col-header">
                <h4 className="tb-col-title">{col.title}</h4>
                <span className="tb-count">{colTasks.length}</span>
              </div>
              
              {colTasks.map(task => (
                <div 
                  key={task._id} 
                  className="tb-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="tb-card-header">
                    <h5 className="tb-card-title">{task.title}</h5>
                    <span className={`tb-pri ${task.priority}`}>{task.priority}</span>
                  </div>
                  
                  {task.description && <p className="tb-card-desc">{task.description}</p>}
                  
                  <div className="tb-card-footer">
                    <div className="tb-assignee">
                      {task.assignee ? (
                         <img src={task.assignee.photoUrl || defaultAvatar} alt="assignee" className="tb-assignee-img" title={task.assignee.firstName} />
                      ) : (
                         <span style={{fontSize:'12px', color:'var(--dashboard-text-faint)'}}>Unassigned</span>
                      )}
                    </div>
                    <div className="tb-actions">
                      <select 
                        value={task.status} 
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Prog</option>
                        <option value="done">Done</option>
                      </select>
                      <button 
                        onClick={() => handleDeleteTask(task._id)}
                        style={{background:'transparent', border:'none', color:'#ef4444', cursor:'pointer', marginLeft:'8px'}}
                        title="Delete Task"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {colTasks.length === 0 && (
                <div style={{textAlign:'center', padding:'20px', color:'var(--dashboard-glass-border-solid)', border:'2px dashed var(--dashboard-border)', borderRadius:'8px'}}>
                  Drop here
                </div>
              )}
            </div>
          );
        })}
      </div>
    
    </div>
  );
};

export default TaskBoard;
