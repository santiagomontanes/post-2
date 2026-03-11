import { ipcMain } from 'electron';
import { listAuditLogs } from '../db/queries';
import { requirePermissionFromPayload } from './rbac';

export const registerAuditIpc = (): void => {
  ipcMain.handle('audit:list', (_e, payload) => {
    requirePermissionFromPayload(payload, 'audit:read');
    const data = (payload as any)?.filters ?? payload;
    return listAuditLogs({
      from: String((data as any)?.from ?? ''),
      to: String((data as any)?.to ?? ''),
      actorId: (data as any)?.actorId ? String((data as any)?.actorId) : undefined,
      action: (data as any)?.action ? String((data as any)?.action) : undefined,
      limit: Number((data as any)?.limit ?? 100),
      offset: Number((data as any)?.offset ?? 0),
    });
  });
};
