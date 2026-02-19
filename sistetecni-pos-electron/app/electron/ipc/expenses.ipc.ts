import { ipcMain } from 'electron';
import { addExpense, listExpenses } from '../db/queries';
import { requireAdmin } from './rbac';

export const registerExpensesIpc = (): void => {
  ipcMain.handle('expenses:add', (_e, payload) => {
    requireAdmin(payload);
    return addExpense((payload as any)?.expense ?? payload);
  });

  ipcMain.handle('expenses:list', (_e, payload) => {
    requireAdmin(payload);
    return listExpenses(String((payload as any)?.from ?? ''), String((payload as any)?.to ?? ''));
  });
};
