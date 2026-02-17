import { Link } from 'react-router-dom';

export const Sidebar = () => (
  <aside className="sidebar">
    <h2>Sistetecni POS</h2>
    {['/dashboard','/pos','/inventory','/expenses','/cash','/reports','/settings'].map((r) => (
      <Link key={r} to={r}>{r.replace('/','').toUpperCase()}</Link>
    ))}
  </aside>
);
