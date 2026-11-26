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

export default function EmployeeOverview({ employeeId, onNavigate }) {
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErrors, setLoadErrors] = useState([]);

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    const requests = [
      axios.get(`/tasks/assignedTasks/${encodeURIComponent(employeeId)}`),
      axios.get(`/leave/employee/${encodeURIComponent(employeeId)}`),
      axios.get(`/salaryCreditions/employee/${encodeURIComponent(employeeId)}`),
    ];

    Promise.allSettled(requests).then(results => {
      if (!active) return;
      const readResult = (result, setter, label) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value.data)) {
          setter(result.value.data);
          return null;
        }
        setter([]);
        return label;
      };
      setLoadErrors([
        readResult(results[0], setTasks, 'tasks'),
        readResult(results[1], setLeaves, 'leave requests'),
        readResult(results[2], setSalaries, 'salary records'),
      ].filter(Boolean));
      setLoading(false);
    });

    return () => { active = false; };
  }, [employeeId]);

  const orderedTasks = useMemo(() => [...tasks].sort((a, b) => {
    const aDate = Date.parse(a.deadline || '');
    const bDate = Date.parse(b.deadline || '');
    if (Number.isFinite(aDate) && Number.isFinite(bDate)) return aDate - bDate;
    if (Number.isFinite(aDate)) return -1;
    if (Number.isFinite(bDate)) return 1;
    return byNewestId(a, b);
  }), [tasks]);
  const recentLeaves = useMemo(() => [...leaves].sort(byNewestId).slice(0, 3), [leaves]);
  const activeTasks = tasks.filter(task => taskProgress(task) < 100);
  const completedTasks = tasks.length - activeTasks.length;
  const pendingLeaves = leaves.filter(leave => leave.status === 'Pending').length;
  const currentYear = String(new Date().getFullYear());
  const yearlySalary = salaries
    .filter(salary => salary.date?.startsWith(currentYear))
    .reduce((total, salary) => total + Number(salary.amount || 0), 0);
  const tasksToShow = orderedTasks.filter(task => taskProgress(task) < 100).slice(0, 4);

  return (
    <div className="employee-overview">
      <header className="overview-heading">
        <div>
          <p className="overview-eyebrow">EMPLOYEE WORKSPACE</p>
          <h1>Welcome back</h1>
          <p>Your work and team updates at a glance.</p>
        </div>
        <span className="overview-employee-id">Employee ID <strong>{employeeId}</strong></span>
      </header>

      {loadErrors.length > 0 && <p className="overview-load-warning" role="status">Some {loadErrors.join(', ')} could not be loaded. Other dashboard information is still available.</p>}
      {loading ? <p className="overview-loading">Loading your overview…</p> : (
        <>
          <section className="overview-metrics" aria-label="Your summary">
            <Metric label="Tasks to complete" value={activeTasks.length} detail="Assigned work still open" tone="teal" />
            <Metric label="Tasks completed" value={completedTasks} detail={`of ${tasks.length} assigned`} tone="green" />
            <Metric label="Pending leave" value={pendingLeaves} detail={`${leaves.length} requests in total`} tone="amber" />
            <Metric label={`Credited in ${currentYear}`} value={`₹${yearlySalary.toLocaleString('en-IN')}`} detail="Salary credits this year" tone="blue" />
          </section>

          <section className="overview-panels">
            <article className="overview-panel overview-work-panel">
              <div className="overview-panel-heading">
                <div><p className="overview-eyebrow">YOUR WORK</p><h2>Tasks to move forward</h2></div>
                <button className="overview-text-button" onClick={() => onNavigate('tasks')}>Update progress <span aria-hidden="true">→</span></button>
              </div>
              {tasksToShow.length === 0 ? <p className="overview-empty">You’re all caught up. New assigned tasks will appear here.</p> : (
                <div className="overview-task-list">
                  {tasksToShow.map(task => {
                    const progress = taskProgress(task);
                    const status = taskStatus(progress);
                    const statusClass = status.toLowerCase().replace(' ', '-');
                    return (
                      <div className="overview-task" key={task.id || task._id}>
                        <div className="overview-task-top">
                          <div><strong>{task.title}</strong><small>Due {task.deadline || 'date not set'} · {task.priority || 'No'} priority</small></div>
                          <span className={`task-status task-status-${statusClass}`}>{status}</span>
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
                <div><p className="overview-eyebrow">TIME AWAY</p><h2>Recent leave requests</h2></div>
                <button className="overview-text-button" onClick={() => onNavigate('leave')}>View all <span aria-hidden="true">→</span></button>
              </div>
              {recentLeaves.length === 0 ? <p className="overview-empty">No leave requests yet.</p> : (
                <div className="overview-leave-list">
                  {recentLeaves.map(leave => (
                    <div className="overview-leave" key={leave.id || leave._id}>
                      <div><strong>{leave.type} leave</strong><small>{leave.reason}</small></div>
                      <span className={`overview-leave-status overview-leave-${String(leave.status || 'pending').toLowerCase()}`}>{leave.status || 'Pending'}</span>
                    </div>
                  ))}
                </div>
              )}
              <button className="overview-secondary-button" onClick={() => onNavigate('salary')}>View salary details</button>
            </article>
          </section>
        </>
      )}
    </div>
  );
}
