import { ipcMain } from 'electron';
import { closeCash, getCashStatus, getOpenCash, getOpenSuggestion, openCash } from '../db/queries';
import { createBackup } from './backups.ipc';
import { requirePermissionFromPayload } from './rbac';

export const registerCashIpc = (): void => {
  ipcMain.handle('cash:open', (_e, payload) => {
    requirePermissionFromPayload(payload, 'cash:openclose');
    return openCash((payload as any)?.cash ?? payload);
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
    const result = closeCash((payload as any)?.cash ?? payload);
    const base = typeof result === 'object' && result !== null ? result : {};
    try {
      const backupPath = await createBackup('cash_close');
      return { ...base, backupPath };
    } catch {
      return { ...base, backupPath: null };
    }
  });
};
