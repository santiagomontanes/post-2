export type Role = 'ADMIN' | 'SUPERVISOR' | 'SELLER';

export type Permission =
  | 'pos:sell'
  | 'sales:read:own'
  | 'sales:read:all'
  | 'cash:openclose'
  | 'cash:read'
  | 'users:read'
  | 'users:write'
  | 'reports:read'
  | 'inventory:read'
  | 'inventory:write'
  | 'audit:read'
  | 'config:write';

const allPermissions: Permission[] = [
  'pos:sell',
  'sales:read:own',
  'sales:read:all',
  'cash:openclose',
  'cash:read',
  'users:read',
  'users:write',
  'reports:read',
  'inventory:read',
  'inventory:write',
  'audit:read',
  'config:write',
];

export const rolePermissions = (role: Role): Set<Permission> => {
  if (role === 'ADMIN') return new Set(allPermissions);
  if (role === 'SUPERVISOR') {
    return new Set(['pos:sell', 'sales:read:all', 'cash:openclose', 'cash:read', 'reports:read']);
  }
  return new Set(['pos:sell', 'sales:read:own']);
};

export const can = (role: Role, permission: Permission): boolean => rolePermissions(role).has(permission);

export const requirePermission = (role: Role, permission: Permission): void => {
  if (!can(role, permission)) throw new Error('FORBIDDEN');
};
