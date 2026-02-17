import { ipcMain } from 'electron';
import { archiveProduct, listProducts, updateProduct, upsertProduct } from '../db/queries';

export const registerProductsIpc = (): void => {
  ipcMain.handle('products:list', (_e, search: string) => listProducts(search));
  ipcMain.handle('products:save', (_e, payload) => upsertProduct(payload));
  ipcMain.handle('products:update', (_e, payload) => {
    const id = (payload as { id?: string } | undefined)?.id;
    if (!id) throw new Error('Missing product id');
    const product = updateProduct(payload);
    return { ok: true, id, product };
  });
  ipcMain.handle('products:archive', (_e, id: string) => {
    archiveProduct(id);
    return true;
  });
};
