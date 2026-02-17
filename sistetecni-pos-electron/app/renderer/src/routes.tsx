import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './ui/Layout';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Inventory } from './pages/Inventory';
import { Expenses } from './pages/Expenses';
import { Cash } from './pages/Cash';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export const AppRoutes = ({ user }: { user: any }) => (
  <Routes>
    <Route element={<Layout user={user} />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/pos" element={<POS user={user} />} />
      <Route path="/inventory" element={<Inventory role={user.role} />} />
      <Route path="/expenses" element={<Expenses />} />
      <Route path="/cash" element={<Cash user={user} />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings role={user.role} />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>
  </Routes>
);
