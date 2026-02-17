import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { getDb } from './db/db';
import { registerAuthIpc } from './ipc/auth.ipc';
import { registerProductsIpc } from './ipc/products.ipc';
import { registerSalesIpc } from './ipc/sales.ipc';
import { registerExpensesIpc } from './ipc/expenses.ipc';
import { registerReportsIpc } from './ipc/reports.ipc';
import { ensureDailyBackup, registerBackupsIpc } from './ipc/backups.ipc';
import { registerCashIpc } from './ipc/cash.ipc';

const createWindow = async (): Promise<void> => {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) await win.loadURL(devUrl);
  else await win.loadFile(path.join(__dirname, '../renderer/index.html'));
};

app.whenReady().then(async () => {
  getDb();
  registerAuthIpc();
  registerProductsIpc();
  registerSalesIpc();
  registerExpensesIpc();
  registerReportsIpc();
  registerBackupsIpc();
  registerCashIpc();
  await ensureDailyBackup();
  await createWindow();
});
