import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';
import NotificationBell from './NotificationBell';

jest.mock('axios');

test('shows unread updates, routes to the relevant section, and remembers read state', async () => {
  window.localStorage.clear();
  axios.get.mockResolvedValue({ data: [{
    id: 'task-assigned-7',
    title: 'New task assigned',
    message: 'Prepare the report.',
    createdAt: '2026-11-26T10:00:00',
    destination: 'tasks',
  }] });
  const onNavigate = jest.fn();

  render(<NotificationBell role="employee" userId="EMP-1" onNavigate={onNavigate} />);

  const bell = await screen.findByRole('button', { name: 'Notifications, 1 unread' });
  fireEvent.click(bell);
  fireEvent.click(await screen.findByRole('button', { name: /new task assigned prepare the report/i }));

  expect(onNavigate).toHaveBeenCalledWith('tasks');
  expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
  expect(JSON.parse(window.localStorage.getItem('epmp.notifications.read.employee.EMP-1'))).toContain('task-assigned-7');
}, 15000);
