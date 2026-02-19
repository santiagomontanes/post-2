import { ipcMain } from 'electron';
import { archiveProduct, listPosProducts, listProducts, updateProduct, upsertProduct } from '../db/queries';
import { requireAdmin, requireRole } from './rbac';

export const registerProductsIpc = (): void => {
  ipcMain.handle('pos:products:list', (_e, payload) => {
    requireRole(payload, ['ADMIN', 'SELLER']);
    return listPosProducts(String((payload as any)?.search ?? ''));
  });

  ipcMain.handle('products:list', (_e, payload) => {
    requireAdmin(payload);
    return listProducts(String((payload as any)?.search ?? ''));
  });

  ipcMain.handle('products:save', (_e, payload) => {
    requireAdmin(payload);
    return upsertProduct((payload as any)?.product ?? payload);
  });

  ipcMain.handle('products:update', (_e, payload) => {
    requireAdmin(payload);
    const productPayload = (payload as any)?.product ?? payload;
    const id = (productPayload as { id?: string } | undefined)?.id;
    if (!id) throw new Error('Missing product id');
    const product = updateProduct(productPayload);
    return { ok: true, id, product };
  });

  ipcMain.handle('products:archive', (_e, payload) => {
    requireAdmin(payload);
    const id = (payload as any)?.id ?? payload;
    archiveProduct(id);
    return true;
  });
};
