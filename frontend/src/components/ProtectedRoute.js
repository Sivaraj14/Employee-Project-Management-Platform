import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate, useParams } from 'react-router-dom';

export default function ProtectedRoute({ role, children }) {
  const { employeeID, managerID } = useParams();
  const [auth, setAuth] = useState({ status: 'checking', user: null });

  useEffect(() => {
    let active = true;
    axios.get('/auth/session')
      .then(({ data }) => {
        if (!active) return;
        const user = data.user;
        if (user.role !== role) setAuth({ status: 'wrong-role', user });
        else if (user.id !== (role === 'employee' ? employeeID : managerID)) setAuth({ status: 'wrong-user', user });
        else setAuth({ status: 'authorized', user });
      })
      .catch(() => { if (active) setAuth({ status: 'unauthenticated', user: null }); });
    return () => { active = false; };
  }, [employeeID, managerID, role]);

  if (auth.status === 'checking') return <main className="auth-loading" role="status">Checking your sign-in…</main>;
  if (auth.status === 'authorized') return children;
  if (auth.status === 'wrong-role' || auth.status === 'wrong-user') {
    const path = auth.user.role === 'manager'
      ? `/manager/dashboard/${encodeURIComponent(auth.user.id)}`
      : `/employee/dashboard/${encodeURIComponent(auth.user.id)}`;
    return <Navigate to={path} replace />;
  }
  return <Navigate to={`/login/${role}`} replace />;
}
