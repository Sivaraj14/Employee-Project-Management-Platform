import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const byNewestId = (a, b) => Number(b.id || b._id) - Number(a.id || a._id);
const taskProgress = task => Math.max(0, Math.min(100, Number(task.progress ?? task.progressPercentage ?? 0)));
const taskStatus = progress => progress <= 0 ? 'Not Started' : progress >= 100 ? 'Completed' : 'In Progress';

function Metric({ label, value, detail, tone }) {
  return (
    <article className={`overview-metric overview-metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export default function ManagerOverview({ managerId, onNavigate }) {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErrors, setLoadErrors] = useState([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.allSettled([
      axios.get('/employee/get'),
      axios.get('/tasks/assignedTasks/all'),
      axios.get('/leave/all'),
    ]).then(results => {
      if (!active) return;
      const take = (result, setter, label) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value.data)) {
          setter(result.value.data);
          return null;
        }
        setter([]);
        return label;
      };
      setLoadErrors([
        take(results[0], setEmployees, 'employee records'),
        take(results[1], setTasks, 'tasks'),
        take(results[2], setLeaves, 'leave requests'),
      ].filter(Boolean));
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const recentTasks = useMemo(() => [...tasks].sort(byNewestId).slice(0, 4), [tasks]);
  const recentLeaves = useMemo(() => [...leaves].sort(byNewestId).slice(0, 4), [leaves]);
  const activeEmployees = employees.filter(employee => employee.active ?? employee.isActive).length;
  const pendingLeaves = leaves.filter(leave => leave.status === 'Pending').length;
  const completedTasks = tasks.filter(task => taskProgress(task) >= 100).length;
  const openTasks = tasks.length - completedTasks;

  return (
    <div className="employee-overview manager-overview">
      <header className="overview-heading">
        <div>
          <p className="overview-eyebrow">MANAGER WORKSPACE</p>
          <h1>Team overview</h1>
          <p>See what needs attention across your people and projects.</p>
        </div>
        <span className="overview-employee-id">Manager ID <strong>{managerId}</strong></span>
      </header>

      {loadErrors.length > 0 && <p className="overview-load-warning" role="status">Some {loadErrors.join(', ')} could not be loaded. Other dashboard information is still available.</p>}
      {loading ? <p className="overview-loading">Loading your team overview…</p> : (
        <>
          <section className="overview-metrics" aria-label="Team summary">
            <Metric label="Active employees" value={activeEmployees} detail="People ready to work" tone="teal" />
            <Metric label="Open tasks" value={openTasks} detail={`${tasks.length} assignments in total`} tone="amber" />
            <Metric label="Tasks completed" value={completedTasks} detail="At 100% completion" tone="green" />
            <Metric label="Pending leave" value={pendingLeaves} detail="Requests awaiting review" tone="blue" />
          </section>

          <div className="overview-quick-actions" aria-label="Manager actions">
            <button onClick={() => onNavigate('assignTask')}>Assign a task <span aria-hidden="true">↗</span></button>
            <button onClick={() => onNavigate('approveLeave')}>Review leave <span aria-hidden="true">↗</span></button>
            <button onClick={() => onNavigate('viewTasks')}>View all tasks <span aria-hidden="true">↗</span></button>
            <button onClick={() => onNavigate('creditSalary')}>Credit salary <span aria-hidden="true">↗</span></button>
          </div>

          <section className="overview-panels">
            <article className="overview-panel overview-work-panel">
              <div className="overview-panel-heading">
                <div><p className="overview-eyebrow">PROJECTS</p><h2>Recent assignments</h2></div>
                <button className="overview-text-button" onClick={() => onNavigate('viewTasks')}>View all <span aria-hidden="true">→</span></button>
              </div>
              {recentTasks.length === 0 ? <p className="overview-empty">No assignments yet. Create a task to get work moving.</p> : (
                <div className="overview-task-list">
                  {recentTasks.map(task => {
                    const progress = taskProgress(task);
                    const status = taskStatus(progress);
                    return (
                      <div className="overview-task" key={task.id || task._id}>
                        <div className="overview-task-top">
                          <div><strong>{task.title}</strong><small>{task.employeeId} · Due {task.deadline || 'date not set'}</small></div>
                          <span className={`task-status task-status-${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
                        </div>
                        <div className="overview-progress-line">
                          <div className="overview-progress-track" role="progressbar" aria-label={`Completion for ${task.title}`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
                          <strong>{progress}%</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="overview-panel overview-leave-panel">
              <div className="overview-panel-heading">
                <div><p className="overview-eyebrow">PEOPLE</p><h2>Leave requests</h2></div>
                <button className="overview-text-button" onClick={() => onNavigate('approveLeave')}>Review <span aria-hidden="true">→</span></button>
              </div>
              {recentLeaves.length === 0 ? <p className="overview-empty">No leave requests have been submitted.</p> : (
                <div className="overview-leave-list">
                  {recentLeaves.map(leave => (
                    <div className="overview-leave" key={leave.id || leave._id}>
                      <div><strong>{leave.employeeId} · {leave.type}</strong><small>{leave.reason}</small></div>
                      <span className={`overview-leave-status overview-leave-${String(leave.status || 'pending').toLowerCase()}`}>{leave.status || 'Pending'}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </div>
  );
}
