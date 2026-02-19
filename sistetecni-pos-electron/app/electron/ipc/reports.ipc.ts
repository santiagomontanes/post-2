import { ipcMain } from 'electron';
import { getLast7DaysSales, getTodaySummary, reportSalesByDay, reportSummary, reportTopProducts } from '../db/queries';
import { requirePermissionFromPayload } from './rbac';

export const registerReportsIpc = (): void => {
  ipcMain.handle('reports:sales-by-day', (_e, payload) => {
    requirePermissionFromPayload(payload, 'reports:read');
    return reportSalesByDay(String((payload as any)?.from ?? ''), String((payload as any)?.to ?? ''));
  });

  ipcMain.handle('reports:top-products', (_e, payload) => {
    requirePermissionFromPayload(payload, 'reports:read');
    return reportTopProducts(String((payload as any)?.from ?? ''), String((payload as any)?.to ?? ''));
  });

  ipcMain.handle('reports:summary', (_e, payload) => {
    requirePermissionFromPayload(payload, 'reports:read');
    return reportSummary(String((payload as any)?.from ?? ''), String((payload as any)?.to ?? ''));
  });

  ipcMain.handle('reports:today-summary', (_e, payload) => {
    requirePermissionFromPayload(payload, 'reports:read');
    return getTodaySummary();
  });

  ipcMain.handle('reports:last-7-days-sales', (_e, payload) => {
    requirePermissionFromPayload(payload, 'reports:read');
    return getLast7DaysSales();
  });
};
