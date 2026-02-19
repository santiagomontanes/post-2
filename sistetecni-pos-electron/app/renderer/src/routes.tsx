import { Navigate, Route, Routes } from 'react-router-dom';
import { can, type Permission } from '../../../shared/permissions';
import { Layout } from './ui/Layout';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Inventory } from './pages/Inventory';
import { Expenses } from './pages/Expenses';
import { Cash } from './pages/Cash';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Users } from './pages/Users';

const RequirePermission = ({ user, permission, children }: { user: any; permission: Permission; children: JSX.Element }) =>
  can(user?.role, permission) ? children : <Navigate to="/pos" replace />;

export const AppRoutes = ({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <Routes>
    <Route element={<Layout user={user} onLogout={onLogout} />}>
      <Route path="/pos" element={<RequirePermission user={user} permission="pos:sell"><POS user={user} /></RequirePermission>} />
      <Route path="/dashboard" element={<RequirePermission user={user} permission="reports:read"><Dashboard /></RequirePermission>} />
      <Route path="/inventory" element={<RequirePermission user={user} permission="inventory:read"><Inventory role={user.role} /></RequirePermission>} />
      <Route path="/expenses" element={<RequirePermission user={user} permission="config:write"><Expenses /></RequirePermission>} />
      <Route path="/cash" element={<RequirePermission user={user} permission="cash:read"><Cash user={user} /></RequirePermission>} />
      <Route path="/reports" element={<RequirePermission user={user} permission="reports:read"><Reports /></RequirePermission>} />
      <Route path="/settings" element={<RequirePermission user={user} permission="config:write"><Settings role={user.role} /></RequirePermission>} />
      <Route path="/users" element={<RequirePermission user={user} permission="users:read"><Users /></RequirePermission>} />
      <Route path="*" element={<Navigate to={can(user?.role, 'reports:read') ? '/dashboard' : '/pos'} replace />} />
    </Route>
  </Routes>
);
