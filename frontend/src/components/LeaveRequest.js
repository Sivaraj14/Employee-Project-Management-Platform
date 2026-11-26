import React, { useState } from 'react';
import './hr.css';

export default function LeaveRequest() {
  const [form, setForm] = useState({
    name: '',
    employeeId: '',
    attendance: '',
    reason: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <form className="leave-request-form" onSubmit={handleSubmit}>
      <h2>Leave Request</h2>

      <label>Name</label>
      <input type="text" name="name" value={form.name} onChange={handleChange} required />

      <label>Employee ID</label>
      <input type="text" name="employeeId" value={form.employeeId} onChange={handleChange} required />

      <label>Attendance Percentage</label>
      <input type="number" name="attendance" min="0" max="100" step="0.01" value={form.attendance} onChange={handleChange} required />

      <label>Reason</label>
      <textarea name="reason" value={form.reason} onChange={handleChange} required />

      <button className="action-btn" type="submit">Submit Request</button>
    </form>
  );
}
