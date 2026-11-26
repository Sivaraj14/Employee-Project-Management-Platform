import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';
import EmployeeOverview from './EmployeeOverview';

jest.mock('axios');

test('shows employee task, leave, and yearly salary summaries with quick links', async () => {
  const currentYear = String(new Date().getFullYear());
  const today = new Date().toISOString().slice(0, 10);
  axios.get.mockImplementation(url => {
    if (url.startsWith('/tasks/')) {
      return Promise.resolve({ data: [
        { id: 2, title: 'Code review', deadline: today, priority: 'High', progress: 50 },
        { id: 1, title: 'Old task', deadline: today, priority: 'Low', progress: 100 },
      ] });
    }
    if (url.startsWith('/leave/')) {
      return Promise.resolve({ data: [{ id: 3, type: 'Casual', reason: 'Family event', status: 'Pending' }] });
    }
    return Promise.resolve({ data: [{ id: 4, date: `${currentYear}-01-10`, amount: 12000, remarks: 'Monthly pay' }] });
  });
  const onNavigate = jest.fn();

  render(<EmployeeOverview employeeId="EMP-1" onNavigate={onNavigate} />);

  expect(await screen.findByText('Code review')).toBeInTheDocument();
  expect(screen.getByText('Tasks to complete').parentElement).toHaveTextContent('1');
  expect(screen.getByText('Tasks completed').parentElement).toHaveTextContent('1');
  expect(screen.getByText(`Credited in ${currentYear}`).parentElement).toHaveTextContent('₹12,000');
  expect(screen.getByText('Family event')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /view all/i }));
  expect(onNavigate).toHaveBeenCalledWith('leave');
});
