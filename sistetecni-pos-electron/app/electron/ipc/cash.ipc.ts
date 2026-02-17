import { ipcMain } from 'electron';
import { closeCash, getOpenCash, openCash } from '../db/queries';
import { createAutomaticBackup } from './backups.ipc';

export const registerCashIpc = (): void => {
  ipcMain.handle('cash:open', (_e, payload) => openCash(payload));
  ipcMain.handle('cash:get-open', () => getOpenCash());
  ipcMain.handle('cash:close', (_e, payload) => {
    const result = closeCash(payload);
    const backupPath = createAutomaticBackup();
    const base = typeof result === 'object' && result !== null ? result : {};
    return { ...base, backupPath };
  });
};
