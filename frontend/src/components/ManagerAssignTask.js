import React, { useState } from 'react';
import axios from 'axios';

const initialTask = { employeeId: '', title: '', deadline: '', priority: '' };

export default function ManagerAssignTask() {
  const [task, setTask] = useState(initialTask);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = event => {
    const { name, value } = event.target;
    setTask(current => ({ ...current, [name]: value }));
  };

  const assignTask = async event => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await axios.post('/tasks/assignedTasks', { ...task, employeeId: task.employeeId.trim(), title: task.title.trim() });
      setTask(initialTask);
      setMessage('Task assigned successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not assign this task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="assign-task-container" onSubmit={assignTask}>
      <h3>Assign a task</h3>
      <label>Employee ID<input name="employeeId" value={task.employeeId} placeholder="Enter employee ID" onChange={handleChange} required /></label>
      <label>Task title<input name="title" value={task.title} placeholder="What needs to be done?" onChange={handleChange} required /></label>
      <label>Deadline<input name="deadline" type="date" value={task.deadline} onChange={handleChange} required /></label>
      <label>Priority
        <select name="priority" value={task.priority} onChange={handleChange} required>
          <option value="">Select priority</option><option>High</option><option>Medium</option><option>Low</option>
        </select>
      </label>
      <button type="submit" disabled={saving}>{saving ? 'Assigning…' : 'Assign task'}</button>
      {message && <p role="status" aria-live="polite">{message}</p>}
    </form>
  );
}
