import { ipcMain } from 'electron';
import { archiveProduct, listPosProducts, listProducts, logAudit, updateProduct, upsertProduct } from '../db/queries';
import { requirePermissionFromPayload } from './rbac';

export const registerProductsIpc = (): void => {
  ipcMain.handle('pos:products:list', (_e, payload) => {
    requirePermissionFromPayload(payload, 'pos:sell');
    return listPosProducts(String((payload as any)?.search ?? ''));
  });

  ipcMain.handle('products:list', (_e, payload) => {
    requirePermissionFromPayload(payload, 'inventory:read');
    return listProducts(String((payload as any)?.search ?? ''));
  });

  ipcMain.handle('products:save', (_e, payload) => {
    requirePermissionFromPayload(payload, 'inventory:write');
    const product = (payload as any)?.product ?? payload;
    const id = upsertProduct(product);
    const actorId = String((payload as any)?.userId ?? '');
    if (actorId) logAudit({ actorId, action: 'PRODUCT_SAVE', entityType: 'PRODUCT', entityId: id, metadata: { brand: product?.brand, model: product?.model } });
    return id;
  });

  ipcMain.handle('products:update', (_e, payload) => {
    requirePermissionFromPayload(payload, 'inventory:write');
    const productPayload = (payload as any)?.product ?? payload;
    const id = (productPayload as { id?: string } | undefined)?.id;
    if (!id) throw new Error('Missing product id');
    const product = updateProduct(productPayload);
    const actorId = String((payload as any)?.userId ?? '');
    if (actorId) logAudit({ actorId, action: 'PRODUCT_UPDATE', entityType: 'PRODUCT', entityId: id, metadata: { stock: productPayload?.stock, sale_price: productPayload?.sale_price } });
    return { ok: true, id, product };
  });

  ipcMain.handle('products:archive', (_e, payload) => {
    requirePermissionFromPayload(payload, 'inventory:write');
    const id = (payload as any)?.id ?? payload;
    archiveProduct(id);
    const actorId = String((payload as any)?.userId ?? '');
    if (actorId) logAudit({ actorId, action: 'PRODUCT_DELETE', entityType: 'PRODUCT', entityId: String(id), metadata: { archived: true } });
    return true;
  });
};
