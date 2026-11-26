import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import ProtectedRoute from './ProtectedRoute';

jest.mock('axios');

test('allows the matching signed-in role and redirects anonymous users to sign-in', async () => {
  axios.get.mockResolvedValueOnce({ data: { user: { id: 'EMP-1', role: 'employee' } } });
  const { unmount } = render(
    <MemoryRouter initialEntries={['/employee/dashboard/EMP-1']}>
      <Routes>
        <Route path="/employee/dashboard/:employeeID" element={<ProtectedRoute role="employee"><p>Private employee workspace</p></ProtectedRoute>} />
        <Route path="/login/employee" element={<p>Employee sign in page</p>} />
      </Routes>
    </MemoryRouter>
  );
  expect(await screen.findByText('Private employee workspace')).toBeInTheDocument();
  unmount();

  axios.get.mockRejectedValueOnce(new Error('Unauthenticated'));
  render(
    <MemoryRouter initialEntries={['/employee/dashboard/EMP-1']}>
      <Routes>
        <Route path="/employee/dashboard/:employeeID" element={<ProtectedRoute role="employee"><p>Private employee workspace</p></ProtectedRoute>} />
        <Route path="/login/employee" element={<p>Employee sign in page</p>} />
      </Routes>
    </MemoryRouter>
  );
  expect(await screen.findByText('Employee sign in page')).toBeInTheDocument();
});
