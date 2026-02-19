import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { User } from '../types';

export const Layout = ({ user }: { user: User | null }) => (
  <div className="layout">
    <Sidebar role={user?.role ?? 'SELLER'} />
    <div>
      <Topbar user={user} />
      <main className="main"><Outlet /></main>
    </div>
  </div>
);
