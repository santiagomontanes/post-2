import { ipc } from './ipcClient';
export const salesByDay = (f: string, t: string) => ipc.reports.salesByDay(f, t);
export const topProducts = (f: string, t: string) => ipc.reports.topProducts(f, t);
export const summary = (f: string, t: string) => ipc.reports.summary(f, t);
export const todaySummary = () => ipc.reports.todaySummary();
export const last7DaysSales = () => ipc.reports.last7DaysSales();
