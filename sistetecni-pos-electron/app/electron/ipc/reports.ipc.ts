import { ipcMain } from 'electron';
import { getLast7DaysSales, getTodaySummary, reportSalesByDay, reportSummary, reportTopProducts } from '../db/queries';
import { requireAdmin } from './rbac';

export const registerReportsIpc = (): void => {
  ipcMain.handle('reports:sales-by-day', (_e, payload) => {
    requireAdmin(payload);
    return reportSalesByDay(String((payload as any)?.from ?? ''), String((payload as any)?.to ?? ''));
  });

  ipcMain.handle('reports:top-products', (_e, payload) => {
    requireAdmin(payload);
    return reportTopProducts(String((payload as any)?.from ?? ''), String((payload as any)?.to ?? ''));
  });

  ipcMain.handle('reports:summary', (_e, payload) => {
    requireAdmin(payload);
    return reportSummary(String((payload as any)?.from ?? ''), String((payload as any)?.to ?? ''));
  });

  ipcMain.handle('reports:today-summary', (_e, payload) => {
    requireAdmin(payload);
    return getTodaySummary();
  });

  ipcMain.handle('reports:last-7-days-sales', (_e, payload) => {
    requireAdmin(payload);
    return getLast7DaysSales();
  });
};
