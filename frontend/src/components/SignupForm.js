import React, { useState } from 'react';
import axios from 'axios';
import './hr.css';
import { Link } from 'react-router-dom';

export default function SignupForm({ userType }) {
  const [form, setForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState('');
  const [activationUrl, setActivationUrl] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const { id, name, email, phone, password, confirmPassword } = form;

  if (!id || !name || !email || !phone || !password || !confirmPassword) {
    return setMessage('All fields are required.');
  }

  if (password !== confirmPassword) {
    return setMessage('Passwords do not match.');
  }

  try {
    const endpoint = `/${userType}/Sign-up`;

    const data =
      userType === "manager"
        ? { manager_id: id, name, gmail: email, phone_no: phone, password }
        : { employee_id: id, name, gmail: email, phone_no: phone, password };

    const response = await axios.post(endpoint, data);

    setMessage(response.data.message || 'Account created. Follow the activation instructions to sign in.');
    setActivationUrl(response.data.activationUrl || '');
    setForm({ id: '', name: '', email: '', phone: '', password: '', confirmPassword: '' });

  } catch (err) {
    setMessage(err.response?.data?.message || 'Signup failed. Check your details and try again.');
  }
};

  return (
    <div className="login">
      <div className="back">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>{userType.charAt(0).toUpperCase() + userType.slice(1)} signup</h2>
          <input name="id" value={form.id} placeholder={`${userType.charAt(0).toUpperCase() + userType.slice(1)} ID`} onChange={handleChange} autoComplete="username" required />
          <input name="name" value={form.name} placeholder="Full name" onChange={handleChange} autoComplete="name" required />
          <input type="email" name="email" value={form.email} placeholder="Email address" onChange={handleChange} autoComplete="email" required />
          <input type="tel" name="phone" value={form.phone} placeholder="Phone number" onChange={handleChange} autoComplete="tel" required />
          <input type="password" name="password" value={form.password} placeholder="Password" onChange={handleChange} autoComplete="new-password" required />
          <input type="password" name="confirmPassword" value={form.confirmPassword} placeholder="Confirm password" onChange={handleChange} autoComplete="new-password" required />
          <button className="login-btn" type="submit">Create account</button>
          <p role="status" aria-live="polite">{message}</p>
          {activationUrl && <p><a href={activationUrl}>Activate your account</a></p>}
          <p>Already have an account? <Link to={`/login/${userType}`}>Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}
