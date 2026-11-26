import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; 
import './hr.css';

export default function EmployeeLogin() {
  const [employee, setEmployee] = useState({ employeeID: '', employeePassword: '' });
  const [loginStatus, setLoginStatus] = useState('');
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post('/employee/login', {
        employee_id: employee.employeeID,
        password: employee.employeePassword
      });

      setLoginStatus('Login Successful');
      navigate(`/employee/dashboard/${data.user?.id || employee.employeeID}`);

    } catch (err) {
      setLoginStatus(err.response?.data?.message || 'Could not sign in. Check your connection and try again.');
    }
  };


  const handleSignup = () => {
    navigate('/Sign-up/employee');
  };


  return (
    <div className='login'>
    <div className='back'>
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Employee Login</h2>
      <input type="text" name="employeeID" value={employee.employeeID} placeholder="Employee ID" onChange={handleChange} autoComplete="username" required />
      <input type="password" name="employeePassword" value={employee.employeePassword} placeholder="Password" onChange={handleChange} autoComplete="current-password" required />
      <button className="login-btn" type="submit">Login</button>
      <button type='button' className="signup-btn" onClick={handleSignup}>Signup</button>
      <p role="status" aria-live="polite">{loginStatus}</p>
      <p>Are you a Manager? <Link to="/login/manager">Login Here</Link></p>
    </form>
    </div>
    </div>
  );
}
 
