import { ipcMain } from 'electron';
import { closeCash, getCashStatus, getOpenCash, getOpenSuggestion, logAudit, openCash } from '../db/queries';
import { createBackup } from './backups.ipc';
import { requirePermissionFromPayload } from './rbac';

export const registerCashIpc = (): void => {
  ipcMain.handle('cash:open', (_e, payload) => {
    requirePermissionFromPayload(payload, 'cash:openclose');
    const cashPayload = (payload as any)?.cash ?? payload;
    const id = openCash(cashPayload);
    const actorId = String((payload as any)?.userId ?? cashPayload?.userId ?? '');
    if (actorId) logAudit({ actorId, action: 'CASH_OPEN', entityType: 'CASH_SESSION', entityId: id, metadata: { openingCash: cashPayload?.openingCash } });
    return id;
  });

  ipcMain.handle('cash:get-open', (_e, payload) => {
    requirePermissionFromPayload(payload, 'cash:read');
    return getOpenCash();
  });

  ipcMain.handle('cash:get-status', (_e, payload) => {
    requirePermissionFromPayload(payload, 'cash:read');
    return getCashStatus();
  });

  ipcMain.handle('cash:get-open-suggestion', (_e, payload) => {
    requirePermissionFromPayload(payload, 'cash:read');
    return getOpenSuggestion();
  });

  ipcMain.handle('cash:close', async (_e, payload) => {
    requirePermissionFromPayload(payload, 'cash:openclose');
    const cashPayload = (payload as any)?.cash ?? payload;
    const result = closeCash(cashPayload);
    const base = typeof result === 'object' && result !== null ? result : {};
    const actorId = String((payload as any)?.userId ?? cashPayload?.userId ?? '');
    if (actorId) logAudit({ actorId, action: 'CASH_CLOSE', entityType: 'CASH_SESSION', entityId: String(cashPayload?.id ?? ''), metadata: base });
    try {
      const backupPath = await createBackup('cash_close');
      return { ...base, backupPath };
    } catch {
      return { ...base, backupPath: null };
    }
  });
};
