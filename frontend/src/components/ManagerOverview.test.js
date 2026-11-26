import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';
import ManagerOverview from './ManagerOverview';

jest.mock('axios');

test('summarizes manager workload and provides quick actions', async () => {
  axios.get.mockImplementation(url => {
    if (url === '/employee/get') return Promise.resolve({ data: [{ active: true }, { active: false }, { isActive: true }] });
    if (url.startsWith('/tasks/')) return Promise.resolve({ data: [
      { id: 2, employeeId: 'EMP-2', title: 'Latest task', deadline: '2026-12-15', progress: 50 },
      { id: 1, employeeId: 'EMP-1', title: 'Finished task', deadline: '2026-12-01', progress: 100 },
    ] });
    return Promise.resolve({ data: [
      { id: 4, employeeId: 'EMP-2', type: 'Casual', reason: 'Family event', status: 'Pending' },
      { id: 3, employeeId: 'EMP-1', type: 'Sick', reason: 'Medical appointment', status: 'Approved' },
    ] });
  });
  const onNavigate = jest.fn();

  render(<ManagerOverview managerId="MGR-1" onNavigate={onNavigate} />);

  expect(await screen.findByText('Latest task')).toBeInTheDocument();
  expect(screen.getByText('Active employees').parentElement).toHaveTextContent('2');
  expect(screen.getByText('Open tasks').parentElement).toHaveTextContent('1');
  expect(screen.getByText('Pending leave').parentElement).toHaveTextContent('1');
  expect(screen.getByText('Family event')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /assign a task/i }));
  expect(onNavigate).toHaveBeenCalledWith('assignTask');
});
