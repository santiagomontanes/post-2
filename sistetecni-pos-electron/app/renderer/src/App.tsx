import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from './pages/Login';
import { AppRoutes } from './routes';

function App() {
  const [user, setUser] = useState<any>(null);
  if (!user) return <Login onLogin={setUser} />;
  return <BrowserRouter><AppRoutes user={user} /></BrowserRouter>;
}

export default App;
