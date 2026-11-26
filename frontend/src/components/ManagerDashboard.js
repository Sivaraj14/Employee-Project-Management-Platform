import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './hr.css';
import ManagerLeaveApproval from './ManagerLeaveApproval';
import ManagerAssignTask from './ManagerAssignTask';
import ManagerViewTasks from './ManagerViewTasks';
import ManagerCreditSalary from './ManagerCreditSalary';
import ManagerOverview from './ManagerOverview';
import NotificationBell from './NotificationBell';
import {
  UserCircleIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ArrowLeftOnRectangleIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { managerID } = useParams();

  const logout = async () => {
    try { await axios.post('/auth/logout'); } catch { /* Local navigation still ends this session view. */ }
    navigate('/');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <ManagerOverview managerId={managerID} onNavigate={setActiveTab} />;
      case 'assignTask': return <ManagerAssignTask managerId={managerID} />;
      case 'viewTasks': return <ManagerViewTasks />;
      case 'creditSalary': return <ManagerCreditSalary managerId={managerID} />;
      default: return <ManagerLeaveApproval managerId={managerID} />;
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2 className="logo"><UserCircleIcon className="h-6 w-6 inline-block mr-2" /><span>Employee &amp; Project Management Platform<small>Manager workspace</small></span></h2>
        <div className="navbar-tools">
          <NotificationBell role="manager" userId={managerID} onNavigate={setActiveTab} />
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
        <div className="scrollable-sidebar">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}><HomeIcon className="h-5 w-5 inline-block mr-2" />Overview</button>
          <button className={activeTab === 'approveLeave' ? 'active' : ''} onClick={() => setActiveTab('approveLeave')}><CalendarDaysIcon className="h-5 w-5 inline-block mr-2" />Approve Leave</button>
          <button className={activeTab === 'assignTask' ? 'active' : ''} onClick={() => setActiveTab('assignTask')}><UserPlusIcon className="h-5 w-5 inline-block mr-2" />Assign Task</button>
          <button className={activeTab === 'viewTasks' ? 'active' : ''} onClick={() => setActiveTab('viewTasks')}><ClipboardDocumentListIcon className="h-5 w-5 inline-block mr-2" />View Assigned Tasks</button>
          <button className={activeTab === 'creditSalary' ? 'active' : ''} onClick={() => setActiveTab('creditSalary')}><BanknotesIcon className="h-5 w-5 inline-block mr-2" />Credit Salary</button>
        </div>
        <section className="content">{renderTab()}</section>
      </div>
    </div>
  );
}
