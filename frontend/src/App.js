import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './components/Home';
import EmployeeLogin from './components/EmployeeLogin';
import EmployeeSignup from './components/EmployeeSignup';
import ManagerLogin from './components/ManagerLogin';
import ManagerSignup from './components/ManagerSignup';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login/employee" element={<EmployeeLogin />} />
        <Route path="/Sign-up/employee" element={<EmployeeSignup />} />
        <Route path="/login/manager" element={<ManagerLogin />} />
        <Route path="/Sign-up/manager" element={<ManagerSignup />} />

        <Route path="/employee/dashboard/:employeeID" element={<ProtectedRoute role="employee"><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/manager/dashboard/:managerID" element={<ProtectedRoute role="manager"><ManagerDashboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
