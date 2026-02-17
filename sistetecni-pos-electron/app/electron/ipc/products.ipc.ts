import { ipcMain } from 'electron';
import { archiveProduct, listProducts, updateProduct, upsertProduct } from '../db/queries';

export const registerProductsIpc = (): void => {
  ipcMain.handle('products:list', (_e, search: string) => listProducts(search));
  ipcMain.handle('products:save', (_e, payload) => upsertProduct(payload));
  ipcMain.handle('products:update', (_e, payload) => {
    updateProduct(payload);
    return true;
  });
  ipcMain.handle('products:archive', (_e, id: string) => {
    archiveProduct(id);
    return true;
  });
};
