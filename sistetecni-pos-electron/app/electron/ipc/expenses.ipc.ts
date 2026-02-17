import { ipcMain } from 'electron';
import { addExpense, listExpenses } from '../db/queries';

export const registerExpensesIpc = (): void => {
  ipcMain.handle('expenses:add', (_e, payload) => addExpense(payload));
  ipcMain.handle('expenses:list', (_e, from: string, to: string) => listExpenses(from, to));
};
