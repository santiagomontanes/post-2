import { requireAdmin, requireRole, requireSalesAccess } from '../app/electron/ipc/rbac';

describe('RBAC guards', () => {
  test('SELLER cannot run admin modules', () => {
    const seller = { role: 'SELLER' };

    // products:save/update/archive
    expect(() => requireAdmin(seller)).toThrow('FORBIDDEN');

    // cash:open/status/close
    expect(() => requireAdmin(seller)).toThrow('FORBIDDEN');

    // reports:*
    expect(() => requireAdmin(seller)).toThrow('FORBIDDEN');
  });

  test('SELLER can access POS-only channels', () => {
    const seller = { role: 'SELLER' };

    // pos:products:list
    expect(() => requireRole(seller, ['ADMIN', 'SELLER'])).not.toThrow();

    // sales:create
    expect(() => requireSalesAccess(seller)).not.toThrow();
  });

  test('ADMIN has full access', () => {
    const admin = { role: 'ADMIN' };
    expect(() => requireAdmin(admin)).not.toThrow();
    expect(() => requireRole(admin, ['ADMIN', 'SELLER'])).not.toThrow();
    expect(() => requireSalesAccess(admin)).not.toThrow();
  });
});
