import React, { useState } from 'react';
import axios from 'axios';

const initialForm = { employeeId: '', date: '', amount: '', remarks: '' };

export default function ManagerCreditSalary() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = event => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const creditSalary = async event => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await axios.post('/salaryCreditions/credit', {
        ...form,
        employeeId: form.employeeId.trim(),
        amount: Number(form.amount),
      });
      setMessage('Salary credit recorded.');
      setForm(initialForm);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not record this salary credit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="credit-salary-container" onSubmit={creditSalary}>
      <h3>Credit salary</h3>
      <label>Employee ID<input name="employeeId" value={form.employeeId} placeholder="Enter employee ID" onChange={handleChange} required /></label>
      <label>Credit date<input name="date" type="date" value={form.date} onChange={handleChange} required /></label>
      <label>Amount (₹)<input name="amount" type="number" min="1" step="1" value={form.amount} placeholder="0.00" onChange={handleChange} required /></label>
      <label>Remarks<input name="remarks" value={form.remarks} placeholder="Optional note" onChange={handleChange} /></label>
      <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Record credit'}</button>
      {message && <p role="status" aria-live="polite">{message}</p>}
    </form>
  );
}


