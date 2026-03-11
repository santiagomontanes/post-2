import { useState } from 'react';
import { login } from '../services/auth';

export const Login = ({ onLogin }: { onLogin: (u: any) => void }) => {
  const [email, setEmail] = useState('admin@sistetecni.com');
  const [password, setPassword] = useState('Admin123*');
  const [error, setError] = useState('');

  const submit = async () => {
    try { onLogin(await login(email, password)); } catch (e: any) { setError(e.message); }
  };

  return <div className="main"><div className="card grid"><h1>Ingreso</h1><input value={email} onChange={(e)=>setEmail(e.target.value)} /><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /><button onClick={submit}>Entrar</button><small>{error}</small></div></div>;
};
