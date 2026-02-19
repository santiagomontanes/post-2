export type AppRole = 'ADMIN' | 'SELLER';

export const getRoleFromPayload = (payload: unknown): AppRole | null => {
  const role = (payload as { role?: unknown } | null | undefined)?.role;
  if (role === 'ADMIN' || role === 'SELLER') return role;
  return null;
};

export const requireRole = (payload: unknown, allowed: AppRole[]): AppRole => {
  const role = getRoleFromPayload(payload);
  if (!role || !allowed.includes(role)) throw new Error('FORBIDDEN');
  return role;
};

export const requireAdmin = (payload: unknown): void => {
  requireRole(payload, ['ADMIN']);
};

export const requireSalesAccess = (payload: unknown): void => {
  requireRole(payload, ['ADMIN', 'SELLER']);
};
