import { ipc } from './ipcClient';
export const listProducts = (q = '') => ipc.products.list(q);
export const saveProduct = (p: unknown) => ipc.products.save(p);
export const updateProduct = (p: unknown) => ipc.products.update(p);
export const archiveProduct = (id: string) => ipc.products.archive(id);
