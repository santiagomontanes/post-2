import { Link } from 'react-router-dom';
import type { Role } from '../types';

export const Sidebar = ({ role }: { role: Role }) => {
  const routes = role === 'ADMIN'
    ? ['/dashboard', '/pos', '/inventory', '/expenses', '/cash', '/reports', '/settings', '/users']
    : ['/pos'];

  return (
    <aside className="sidebar">
      <h2>Sistetecni POS</h2>
      {routes.map((r) => (
        <Link key={r} to={r}>{r.replace('/', '').toUpperCase()}</Link>
      ))}
    </aside>
  );
};
