import { User } from '../types';
export const Topbar = ({ user }: { user: User | null }) => <header className="topbar"><b>Panel</b><span>{user?.name}</span></header>;
