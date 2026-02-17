import { ipc } from './ipcClient';
export const listProducts = (q = '') => ipc.products.list(q);
export const saveProduct = (p: unknown) => ipc.products.save(p);
export const deleteProduct = (id: string) => ipc.products.delete(id);
