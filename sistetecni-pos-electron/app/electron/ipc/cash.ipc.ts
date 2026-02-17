import { ipcMain } from 'electron';
import { closeCash, getCashStatus, getOpenCash, getOpenSuggestion, openCash } from '../db/queries';
import { createBackup } from './backups.ipc';

export const registerCashIpc = (): void => {
  ipcMain.handle('cash:open', (_e, payload) => openCash(payload));
  ipcMain.handle('cash:get-open', () => getOpenCash());
  ipcMain.handle('cash:get-status', () => getCashStatus());
  ipcMain.handle('cash:get-open-suggestion', () => getOpenSuggestion());
  ipcMain.handle('cash:close', async (_e, payload) => {
    const result = closeCash(payload);
    const base = typeof result === 'object' && result !== null ? result : {};
    try {
      const backupPath = await createBackup('cash_close');
      return { ...base, backupPath };
    } catch {
      return { ...base, backupPath: null };
    }
  });
};
