import { ipc } from './ipcClient';
export const createSale = (p: unknown) => ipc.sales.create(p);
export const printInvoice = (html: string) => ipc.sales.printInvoice(html);
