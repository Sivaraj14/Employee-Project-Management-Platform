import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './hr.css';

export default function EmployeeLeaveRequest({ employeeId }) {
  const [leave, setLeave] = useState({ type: '', reason: '' });
  const [message, setMessage] = useState('');
  const [leaveHistory, setLeaveHistory] = useState([]);

  const handleChange = e => {
    const { name, value } = e.target;
    setLeave(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/leave/submit', {
        employeeId,
        type: leave.type,
        reason: leave.reason,
        status: 'Pending',
        comment: ''
      });

      setMessage('Leave submitted successfully!');
      setLeave({ type: '', reason: '' });
      await fetchLeaveHistory();

    } catch (err) {
      setMessage(err.response?.data?.message || 'Error submitting leave.');
    }
  };

  const fetchLeaveHistory = useCallback(() => {
    axios
      .get(`/leave/employee/${employeeId}`)
      .then(res => {
        setLeaveHistory([...res.data].sort((a, b) => Number(b.id || b._id) - Number(a.id || a._id)));
      })
      .catch(() => setMessage('Could not load leave history. Please try again.'));
  }, [employeeId]);

  useEffect(() => {
    fetchLeaveHistory();
  }, [fetchLeaveHistory]);

  return (
    <div className="leave-request-container">
      <h2>Leave Request</h2>

      <form onSubmit={handleSubmit} className="leave-form">
        <select name="type" value={leave.type} onChange={handleChange} required>
          <option value="">Leave Type</option>
          <option>Sick</option>
          <option>Casual</option>
          <option>Emergency</option>
        </select>

        <input
          name="reason"
          placeholder="Reason"
          value={leave.reason}
          onChange={handleChange}
          required
        />

        <button className="action-btn" type="submit">Submit</button>
        <p>{message}</p>
      </form>

      <h2>Your Leave Requests</h2>
      {leaveHistory.map((l) => (
        <div className="task-box" key={l._id || l.id}>
          <p><b>Type:</b> {l.type}</p>
          <p><b>Reason:</b> {l.reason}</p>
          <p><b>Status:</b> {l.status}</p>
          {l.comment && <p><b>Manager Comment:</b> {l.comment}</p>}
        </div>
      ))}
    </div>
  );
}
