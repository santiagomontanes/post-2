import { ipc } from './ipcClient';
export const listProducts = (q = '') => ipc.products.list(q);
export const saveProduct = (p: unknown) => ipc.products.save(p);
export const updateProduct = (p: unknown) => {
  if (import.meta.env.DEV) console.debug('[products:update] payload', p);
  return ipc.products.update(p);
};
export const archiveProduct = (id: string) => ipc.products.archive(id);
