import React, { useState, useEffect } from 'react';
import axios from 'axios';

const statusForProgress = progress => {
  const completion = Number(progress) || 0;
  if (completion <= 0) return 'Not Started';
  if (completion >= 100) return 'Completed';
  return 'In Progress';
};

export default function EmployeeTaskProgress({ employeeId }) {
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axios.get(`/tasks/assignedTasks/${encodeURIComponent(employeeId)}`)
      .then(({ data }) => setTasks(data.map(task => ({
        ...task,
        progress: Number(task.progress ?? task.progressPercentage ?? 0),
        status: statusForProgress(task.progress ?? task.progressPercentage ?? 0),
        notes: task.notes || '',
      }))))
      .catch(() => {
        setTasks([]);
        setMessage('Could not load tasks. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [employeeId]);

  const handleChange = (index, field, value) => {
    setTasks(current => current.map((task, taskIndex) => {
      if (taskIndex !== index) return task;
      if (field === 'progress') {
        const progress = value === '' ? '' : Math.max(0, Math.min(100, Number(value)));
        return { ...task, progress, status: statusForProgress(progress) };
      }
      return { ...task, [field]: value };
    }));
  };

  const updateTasks = async () => {
    setSaving(true);
    setMessage('');
    try {
      await Promise.all(tasks.map(task => axios.put(`/tasks/updateTask/${task.id || task._id}`, {
        progress: Number(task.progress),
        status: task.status,
        notes: task.notes,
      })));
      setMessage('Task progress updated.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not update task progress. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="task-progress-section"><h3>Your tasks</h3><p>Loading tasks…</p></div>;
  if (tasks.length === 0) return <div className="task-progress-section"><h3>Your tasks</h3><p>{message || 'No tasks have been assigned yet.'}</p></div>;

  return (
    <div className="task-progress-section">
      <h3>Update task progress</h3>
      {tasks.map((task, index) => (
        <div className="task-item" key={task._id || task.id}>
          <div className="task-item-heading">
            <p><strong>{task.title}</strong><small className="task-deadline">Due {task.deadline || 'date not set'} · {task.priority} priority</small></p>
            <span className={`task-status task-status-${task.status.toLowerCase().replace(' ', '-')}`} aria-live="polite" aria-label={`Task status: ${task.status}`}>{task.status}</span>
          </div>
          <label>Progress (%)
            <input type="number" min="0" max="100" value={task.progress} onChange={event => handleChange(index, 'progress', event.target.value)} />
          </label>
          <label>Notes
            <input value={task.notes} onChange={event => handleChange(index, 'notes', event.target.value)} placeholder="Add an update for your manager" />
          </label>
        </div>
      ))}
      <button onClick={updateTasks} disabled={saving}>{saving ? 'Saving…' : 'Save progress'}</button>
      {message && <p role="status" aria-live="polite">{message}</p>}
    </div>
  );
}

