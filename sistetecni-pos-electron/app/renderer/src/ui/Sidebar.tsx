import { Link } from 'react-router-dom';
import { can, type Permission } from '../../../../shared/permissions';
import type { Role } from '../types';

const navItems: Array<{ path: string; permission: Permission }> = [
  { path: '/dashboard', permission: 'reports:read' },
  { path: '/pos', permission: 'pos:sell' },
  { path: '/inventory', permission: 'inventory:read' },
  { path: '/expenses', permission: 'config:write' },
  { path: '/cash', permission: 'cash:read' },
  { path: '/reports', permission: 'reports:read' },
  { path: '/settings', permission: 'config:write' },
  { path: '/users', permission: 'users:read' },
  { path: '/audit', permission: 'audit:read' },
];

export const Sidebar = ({ role }: { role: Role }) => (
  <aside className="sidebar">
    <h2>Sistetecni POS</h2>
    {navItems.filter((x) => can(role, x.permission)).map((r) => (
      <Link key={r.path} to={r.path}>{r.path.replace('/', '').toUpperCase()}</Link>
    ))}
  </aside>
);
