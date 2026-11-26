import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ManagerRateEmployee() {
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/employees')
      .then(res => setEmployees(res.data));
  }, []);

  const rate = (employeeId, score) => {
    axios.post('/ratings', { employeeId, score })
      .then(() => {
        setMessage(`Rated ${employeeId} - ${score}/5`);
      });
  };

  return (
    <div>
      <h3>Rate Employees</h3>
      {employees.map(emp => (
        <div key={emp.id}>
          <p>{emp.id}</p>
          <input
            type="number"
            min="1"
            max="5"
            placeholder="1–5"
            onBlur={e => rate(emp.id, e.target.value)}
          />
        </div>
      ))}
      <p>{message}</p>
    </div>
  );
}
