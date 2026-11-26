import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './hr.css';
import EmployeeTaskProgress from './EmployeeTaskProgress';
import EmployeeLeaveRequest from './EmployeeLeaveRequest';
import EmployeeSalary from './EmployeeSalary';
import EmployeeOverview from './EmployeeOverview';
import NotificationBell from './NotificationBell';
import {
  ClipboardDocumentCheckIcon,
  ArrowLeftOnRectangleIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { employeeID } = useParams();

  const logout = async () => {
    try { await axios.post('/auth/logout'); } catch { /* Local navigation still ends this session view. */ }
    navigate('/');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <EmployeeOverview employeeId={employeeID} onNavigate={setActiveTab} />;
      case 'leave': return <EmployeeLeaveRequest employeeId={employeeID} />;
      case 'salary': return <EmployeeSalary employeeId={employeeID} />;
      default: return <EmployeeTaskProgress employeeId={employeeID} />;
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2 className="logo"><UserCircleIcon className="h-6 w-6 inline-block mr-2" /><span>Employee &amp; Project Management Platform<small>Employee workspace</small></span></h2>
        <div className="navbar-tools">
          <NotificationBell role="employee" userId={employeeID} onNavigate={setActiveTab} />
          <div className="profile-container" role="button" tabIndex={0} aria-label="Open account menu" aria-haspopup="menu" aria-expanded={showDropdown} onClick={() => setShowDropdown(!showDropdown)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') setShowDropdown(!showDropdown); }}>
            <img src="https://i.pravatar.cc/40" alt="Profile" className="profile-img" />
            <span className="dropdown-icon">&#9662;</span>
            {showDropdown && <div className="dropdown-menu" role="menu">
              <div className="dropdown-item" role="menuitem" tabIndex={0}><UserCircleIcon className="h-5 w-5 inline-block mr-2" />View Profile</div>
              <div className="dropdown-item" role="menuitem" tabIndex={0} onClick={event => { event.stopPropagation(); logout(); }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') logout(); }}><ArrowLeftOnRectangleIcon className="h-5 w-5 inline-block mr-2" />Logout</div>
            </div>}
          </div>
        </div>
      </nav>

      <div className="main">
        <aside className="sidebar">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}><HomeIcon className="h-5 w-5 inline-block mr-2" />Overview</button>
          <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}><ClipboardDocumentCheckIcon className="h-5 w-5 inline-block mr-2" />Update Task Progress</button>
          <button className={activeTab === 'leave' ? 'active' : ''} onClick={() => setActiveTab('leave')}><CalendarDaysIcon className="h-5 w-5 inline-block mr-2" />Leave Request</button>
          <button className={activeTab === 'salary' ? 'active' : ''} onClick={() => setActiveTab('salary')}><CurrencyDollarIcon className="h-5 w-5 inline-block mr-2" />Salary Details</button>
        </aside>
        <section className="content">{renderTab()}</section>
      </div>
    </div>
  );
}
