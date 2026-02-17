import { ipcMain } from 'electron';
import { reportSalesByDay, reportSummary, reportTopProducts } from '../db/queries';

export const registerReportsIpc = (): void => {
  ipcMain.handle('reports:sales-by-day', (_e, from: string, to: string) => reportSalesByDay(from, to));
  ipcMain.handle('reports:top-products', (_e, from: string, to: string) => reportTopProducts(from, to));
  ipcMain.handle('reports:summary', (_e, from: string, to: string) => reportSummary(from, to));
};
