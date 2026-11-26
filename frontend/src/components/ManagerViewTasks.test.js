import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import ManagerViewTasks from './ManagerViewTasks';

jest.mock('axios');

test('loads assigned tasks newest first with employee progress and status', async () => {
  axios.get.mockResolvedValue({
    data: [
      { id: 3, employeeId: 'EMP-3', title: 'New task', deadline: '2026-12-10', priority: 'High', progress: 50, notes: 'Halfway' },
      { id: 1, employeeId: 'EMP-1', title: 'Old task', deadline: '2026-12-01', priority: 'Low', progress: 0, notes: '' },
    ],
  });

  render(<ManagerViewTasks />);

  await waitFor(() => expect(screen.getByText('New task')).toBeInTheDocument());
  expect(axios.get).toHaveBeenCalledWith('/tasks/assignedTasks/all');
  expect(screen.getByText('EMP-3')).toBeInTheDocument();
  expect(screen.getByText('In Progress')).toBeInTheDocument();
  expect(screen.getByText('50%')).toBeInTheDocument();
  expect(screen.getByText('Halfway')).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent)).toEqual(['New task', 'Old task']);
});
