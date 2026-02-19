import { ipcMain } from 'electron';
import { closeCash, getCashStatus, getOpenCash, getOpenSuggestion, openCash } from '../db/queries';
import { createBackup } from './backups.ipc';
import { requireAdmin } from './rbac';

export const registerCashIpc = (): void => {
  ipcMain.handle('cash:open', (_e, payload) => {
    requireAdmin(payload);
    return openCash((payload as any)?.cash ?? payload);
  });

  ipcMain.handle('cash:get-open', (_e, payload) => {
    requireAdmin(payload);
    return getOpenCash();
  });

  ipcMain.handle('cash:get-status', (_e, payload) => {
    requireAdmin(payload);
    return getCashStatus();
  });

  ipcMain.handle('cash:get-open-suggestion', (_e, payload) => {
    requireAdmin(payload);
    return getOpenSuggestion();
  });

  ipcMain.handle('cash:close', async (_e, payload) => {
    requireAdmin(payload);
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
