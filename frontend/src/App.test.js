import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the product landing page and sign-in paths', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /good work starts with a better rhythm/i })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /employee sign in/i }).length).toBeGreaterThan(0);
  expect(screen.getByRole('link', { name: /manager workspace/i })).toHaveAttribute('href', '/login/manager');
});
