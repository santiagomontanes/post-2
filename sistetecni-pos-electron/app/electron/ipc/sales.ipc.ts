import { BrowserWindow, ipcMain } from 'electron';
import { createSale } from '../db/queries';
import { generateInvoicePdf } from '../invoice/invoicePdf';

export const registerSalesIpc = (): void => {
  ipcMain.handle('sales:create', async (_e, payload) => {
    const result = createSale(payload);
    const pdf = await generateInvoicePdf({ ...payload, invoiceNumber: result.invoiceNumber });
    return { ...result, pdf };
  });

  ipcMain.handle('sales:print-invoice', async (_e, html: string) => {
    const win = new BrowserWindow({ show: false });
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    win.webContents.print({ silent: false });
    win.close();
    return true;
  });
};
