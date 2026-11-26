import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function EmployeeSalary({ employeeId }) {
  const [salaryList, setSalaryList] = useState([]);
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    axios
      .get(`/salaryCreditions/employee/${employeeId}`)
      .then(res => {
        setSalaryList([...res.data].sort((a, b) => {
          const dateOrder = new Date(b.date).getTime() - new Date(a.date).getTime();
          return dateOrder || Number(b.id || b._id) - Number(a.id || a._id);
        }));
      })
      .catch(() => {
        setSalaryList([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [employeeId]);

  const handleFilter = e => setFilterYear(e.target.value);

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 2010; y <= currentYear; y++) {
    years.push(y.toString());
  }

  const selectedYearSalary = salaryList.filter(s => s.date?.startsWith(filterYear));
  const totalAmount = selectedYearSalary.reduce((sum, s) => sum + Number(s.amount || 0), 0);

  return (
    <div className='salary-container'>
      <h3>Salary Details by Year</h3>

      <select
        value={filterYear}
        onChange={handleFilter}
        style={{ marginBottom: '10px' }}
      >
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p><strong>Total Credited in {filterYear}:</strong> ₹{totalAmount}</p>
          {selectedYearSalary.length === 0 ? <p>No salary records found for {filterYear}.</p> : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount (₹)</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {selectedYearSalary.map(s => (
                <tr key={s._id || s.id}>
                  <td>{s.date ? new Date(s.date).toLocaleDateString() : '—'}</td>
                  <td>₹{s.amount}</td>
                  <td>{s.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </>
      )}
    </div>
  );
}
