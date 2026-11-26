import React, { useEffect, useState } from 'react';
import axios from 'axios';

const statusForProgress = progress => {
  const completion = Number(progress) || 0;
  if (completion <= 0) return 'Not Started';
  if (completion >= 100) return 'Completed';
  return 'In Progress';
};

export default function ManagerViewTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/tasks/assignedTasks/all')
      .then(({ data }) => {
        const orderedTasks = [...data].sort((a, b) => Number(b.id || b._id) - Number(a.id || a._id));
        setTasks(orderedTasks);
      })
      .catch(() => setMessage('Could not load assigned tasks. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard manager-task-list">
      <h2>Assigned Tasks</h2>
      {loading ? <p>Loading assigned tasks…</p> : message ? <p role="alert">{message}</p> : tasks.length === 0 ? (
        <p>No tasks have been assigned yet.</p>
      ) : tasks.map(task => {
        const progress = Math.max(0, Math.min(100, Number(task.progress ?? task.progressPercentage ?? 0)));
        const status = statusForProgress(progress);
        const statusClass = status.toLowerCase().replace(' ', '-');
        return (
          <article className="task-box manager-task-card" key={task.id || task._id}>
            <header className="manager-task-heading">
              <div>
                <h3>{task.title}</h3>
                <p>Employee: <strong>{task.employeeId}</strong></p>
              </div>
              <span className={`task-status task-status-${statusClass}`}>{status}</span>
            </header>
            <div className="manager-task-meta">
              <span>Due {task.deadline || 'date not set'}</span>
              <span>{task.priority || 'No'} priority</span>
            </div>
            <div className="manager-task-progress-label"><span>Completion</span><strong>{progress}%</strong></div>
            <div className="manager-task-progress" role="progressbar" aria-label={`Completion for ${task.title}`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <p className="manager-task-notes"><strong>Employee update:</strong> {task.notes?.trim() || 'No update provided yet.'}</p>
          </article>
        );
      })}
    </div>
  );
}
