import { ipcMain } from 'electron';
import { addExpense, listExpenses } from '../db/queries';
import { requirePermissionFromPayload } from './rbac';

export const registerExpensesIpc = (): void => {
  ipcMain.handle('expenses:add', (_e, payload) => {
    requirePermissionFromPayload(payload, 'config:write');
    return addExpense((payload as any)?.expense ?? payload);
  });

  ipcMain.handle('expenses:list', (_e, payload) => {
    requirePermissionFromPayload(payload, 'config:write');
    return listExpenses(String((payload as any)?.from ?? ''), String((payload as any)?.to ?? ''));
  });
};
