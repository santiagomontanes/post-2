import { ipc } from './ipcClient';
export const login = (email: string, password: string) => ipc.auth.login(email, password);
