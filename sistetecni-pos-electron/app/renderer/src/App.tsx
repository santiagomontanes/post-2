import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from './pages/Login';
import { AppRoutes } from './routes';
import { setSessionUser } from './services/session';

function App() {
  const [user, setUser] = useState<any>(null);
  if (!user) return <Login onLogin={(u) => { setSessionUser(u); setUser(u); }} />;
  return <BrowserRouter><AppRoutes user={user} /></BrowserRouter>;
}

export default App;
