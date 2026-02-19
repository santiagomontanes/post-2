import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './ui/Layout';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Inventory } from './pages/Inventory';
import { Expenses } from './pages/Expenses';
import { Cash } from './pages/Cash';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const AdminOnly = ({ user, children }: { user: any; children: JSX.Element }) =>
  user?.role === 'ADMIN' ? children : <Navigate to="/pos" replace />;

export const AppRoutes = ({ user }: { user: any }) => (
  <Routes>
    <Route element={<Layout user={user} />}>
      <Route path="/pos" element={<POS user={user} />} />
      <Route path="/dashboard" element={<AdminOnly user={user}><Dashboard /></AdminOnly>} />
      <Route path="/inventory" element={<AdminOnly user={user}><Inventory role={user.role} /></AdminOnly>} />
      <Route path="/expenses" element={<AdminOnly user={user}><Expenses /></AdminOnly>} />
      <Route path="/cash" element={<AdminOnly user={user}><Cash user={user} /></AdminOnly>} />
      <Route path="/reports" element={<AdminOnly user={user}><Reports /></AdminOnly>} />
      <Route path="/settings" element={<AdminOnly user={user}><Settings role={user.role} /></AdminOnly>} />
      <Route path="*" element={<Navigate to={user?.role === 'ADMIN' ? '/dashboard' : '/pos'} replace />} />
    </Route>
  </Routes>
);
