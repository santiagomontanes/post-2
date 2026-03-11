import { ipc } from './ipcClient';
import { getAuthContext } from './session';

export const salesByDay = (f: string, t: string) => ipc.reports.salesByDay({ ...getAuthContext(), from: f, to: t });
export const topProducts = (f: string, t: string) => ipc.reports.topProducts({ ...getAuthContext(), from: f, to: t });
export const summary = (f: string, t: string) => ipc.reports.summary({ ...getAuthContext(), from: f, to: t });
export const todaySummary = () => ipc.reports.todaySummary(getAuthContext());
export const last7DaysSales = () => ipc.reports.last7DaysSales(getAuthContext());
