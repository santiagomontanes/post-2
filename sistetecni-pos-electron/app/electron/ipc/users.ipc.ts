import { ipcMain } from 'electron';
import { createUser, listUsers, resetUserPassword } from '../db/queries';
import { requireAdmin } from './rbac';

export const registerUsersIpc = (): void => {
  ipcMain.handle('users:list', (_e, payload) => {
    requireAdmin(payload);
    return listUsers();
  });

  ipcMain.handle('users:create', (_e, payload) => {
    requireAdmin(payload);
    const user = (payload as any)?.user ?? payload;
    return createUser(user);
  });

  ipcMain.handle('users:reset-password', (_e, payload) => {
    requireAdmin(payload);
    const data = (payload as any)?.data ?? payload;
    resetUserPassword(data);
    return { ok: true };
  });
};
