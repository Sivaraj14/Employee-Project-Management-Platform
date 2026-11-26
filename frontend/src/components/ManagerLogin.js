import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; 
import './hr.css';

export default function ManagerLogin() {
  const [manager, setManager] = useState({ managerID: '', managerPassword: '' });
  const [loginStatus, setLoginStatus] = useState('');
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setManager(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post('/manager/login', {
        manager_id: manager.managerID,
        password: manager.managerPassword
      });

      setLoginStatus('Login Successful');
      navigate(`/manager/dashboard/${data.user?.id || manager.managerID}`);

    } catch (err) {
      setLoginStatus(err.response?.data?.message || 'Could not sign in. Check your connection and try again.');
    }
  };

  const handleSignup = () => {
    navigate('/Sign-up/manager');
  };

  return (
    <div className='login'>
      <div className='back'>
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Manager Login</h2>
          <input type="text" name="managerID" value={manager.managerID} placeholder="Manager ID" onChange={handleChange} autoComplete="username" required />
          <input type="password" name="managerPassword" value={manager.managerPassword} placeholder="Password" onChange={handleChange} autoComplete="current-password" required />
          <button className="login-btn" type="submit">Login</button>
          <button type='button' className="signup-btn" onClick={handleSignup}>Signup</button>
          <p role="status" aria-live="polite">{loginStatus}</p>
          <p>Are you an Employee? <Link to="/login/employee">Login Here</Link></p>
        </form>
      </div>
    </div>
  );
}
