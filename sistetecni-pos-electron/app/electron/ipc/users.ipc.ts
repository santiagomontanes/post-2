import { ipcMain } from 'electron';
import { createUser, listUsers, resetUserPassword } from '../db/queries';
import { requirePermissionFromPayload } from './rbac';

export const registerUsersIpc = (): void => {
  ipcMain.handle('users:list', (_e, payload) => {
    requirePermissionFromPayload(payload, 'users:read');
    return listUsers();
  });

  ipcMain.handle('users:create', (_e, payload) => {
    requirePermissionFromPayload(payload, 'users:write');
    const user = (payload as any)?.user ?? payload;
    return createUser(user);
  });

  ipcMain.handle('users:reset-password', (_e, payload) => {
    requirePermissionFromPayload(payload, 'users:write');
    const data = (payload as any)?.data ?? payload;
    resetUserPassword(data);
    return { ok: true };
  });
};
