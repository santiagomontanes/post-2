import fs from 'node:fs';
import path from 'node:path';
import { app, dialog, ipcMain } from 'electron';
import { getDbPath } from '../db/db';

const backupName = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `backup-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.db`;
};

export const createAutomaticBackup = (): string => {
  const dir = path.join(app.getPath('userData'), 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, backupName());
  fs.copyFileSync(getDbPath(), out);
  return out;
};

export const registerBackupsIpc = (): void => {
  ipcMain.handle('backups:export', async () => {
    const target = await dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] });
    if (target.canceled || !target.filePaths[0]) return null;
    const out = path.join(target.filePaths[0], backupName());
    fs.copyFileSync(getDbPath(), out);
    return out;
  });

  ipcMain.handle('backups:restore', async () => {
    const file = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'SQLite DB', extensions: ['db'] }] });
    if (file.canceled || !file.filePaths[0]) return false;
    fs.copyFileSync(file.filePaths[0], getDbPath());
    return true;
  });
};
