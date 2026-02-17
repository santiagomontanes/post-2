import { ipc } from './ipcClient';
export const addExpense = (p: unknown) => ipc.expenses.add(p);
export const listExpenses = (f: string, t: string) => ipc.expenses.list(f, t);
