import { ipcMain } from 'electron';
import { createUser, listUsers, logAudit, resetUserPassword } from '../db/queries';
import { requirePermissionFromPayload } from './rbac';

export const registerUsersIpc = (): void => {
  ipcMain.handle('users:list', (_e, payload) => {
    requirePermissionFromPayload(payload, 'users:read');
    return listUsers();
  });

  ipcMain.handle('users:create', (_e, payload) => {
    requirePermissionFromPayload(payload, 'users:write');
    const user = (payload as any)?.user ?? payload;
    const actorId = String((payload as any)?.userId ?? '');
    const id = createUser(user);
    if (actorId) logAudit({ actorId, action: 'USER_CREATE', entityType: 'USER', entityId: id, metadata: { email: user?.email, role: user?.role } });
    return id;
  });

  ipcMain.handle('users:reset-password', (_e, payload) => {
    requirePermissionFromPayload(payload, 'users:write');
    const data = (payload as any)?.data ?? payload;
    const actorId = String((payload as any)?.userId ?? '');
    resetUserPassword(data);
    if (actorId) logAudit({ actorId, action: 'USER_RESET_PASSWORD', entityType: 'USER', entityId: String(data?.id ?? ''), metadata: { targetUserId: data?.id } });
    return { ok: true };
  });
};
