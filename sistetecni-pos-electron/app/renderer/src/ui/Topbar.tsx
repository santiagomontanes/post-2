import { User } from '../types';

export const Topbar = ({ user, onLogout }: { user: User | null; onLogout: () => void }) => (
  <header className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <b>Panel</b>
    <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span>{user?.name}</span>
      <button onClick={onLogout}>Cerrar sesión</button>
    </span>
  </header>
);
