import { BrowserWindow, ipcMain } from 'electron';
import { createSale, logAudit } from '../db/queries';
import { generateInvoicePdf } from '../invoice/invoicePdf';
import { requirePermissionFromPayload } from './rbac';

export const registerSalesIpc = (): void => {
  ipcMain.handle('sales:create', async (_e, payload) => {
    requirePermissionFromPayload(payload, 'pos:sell');
    const salePayload = (payload as any)?.sale ?? payload;
    const result = createSale(salePayload);
    const actorId = String((payload as any)?.userId ?? salePayload?.userId ?? '');
    if (actorId) logAudit({ actorId, action: 'SALE_CREATE', entityType: 'SALE', entityId: result.saleId, metadata: { invoiceNumber: result.invoiceNumber, total: salePayload?.total, paymentMethod: salePayload?.paymentMethod } });
    const pdf = await generateInvoicePdf({ ...salePayload, invoiceNumber: result.invoiceNumber });
    return { ...result, pdf };
  });

  ipcMain.handle('sales:print-invoice', async (_e, payload) => {
    requirePermissionFromPayload(payload, 'pos:sell');
    const html = typeof payload === 'string' ? payload : String((payload as any)?.html ?? '');
    const win = new BrowserWindow({ show: false });
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    win.webContents.print({ silent: false });
    win.close();
    return true;
  });
};
