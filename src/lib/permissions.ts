import { Role } from '@prisma/client';

export type Resource =
  | 'users'
  | 'locations'
  | 'inventory'
  | 'leads'
  | 'deals'
  | 'suppliers'
  | 'expenses'
  | 'invoices'
  | 'reports'
  | 'audit';

export type Action = 'view' | 'create' | 'update' | 'delete';

type PermissionMap = Record<Role, Partial<Record<Resource, Action[]>>>;

const permissions: PermissionMap = {
  SUPER_ADMIN: {
    users: ['view', 'create', 'update', 'delete'],
    locations: ['view', 'create', 'update', 'delete'],
    inventory: ['view', 'create', 'update', 'delete'],
    leads: ['view', 'create', 'update', 'delete'],
    deals: ['view', 'create', 'update', 'delete'],
    suppliers: ['view', 'create', 'update', 'delete'],
    expenses: ['view', 'create', 'update', 'delete'],
    invoices: ['view', 'create', 'update', 'delete'],
    reports: ['view'],
    audit: ['view'],
  },
  ADMIN: {
    users: ['view', 'create', 'update'],
    locations: ['view', 'update'],
    inventory: ['view', 'create', 'update', 'delete'],
    leads: ['view', 'create', 'update', 'delete'],
    deals: ['view', 'create', 'update', 'delete'],
    suppliers: ['view', 'create', 'update', 'delete'],
    expenses: ['view', 'create', 'update', 'delete'],
    invoices: ['view', 'create', 'update'],
    reports: ['view'],
    audit: ['view'],
  },
  MANAGER: {
    users: ['view'],
    locations: ['view'],
    inventory: ['view', 'create', 'update'],
    leads: ['view', 'create', 'update'],
    deals: ['view', 'create', 'update'],
    suppliers: ['view'],
    expenses: ['view', 'create', 'update'],
    invoices: ['view', 'create'],
    reports: ['view'],
    audit: ['view'],
  },
  SALES: {
    inventory: ['view'],
    leads: ['view', 'create', 'update'],
    deals: ['view', 'create', 'update'],
    reports: ['view'],
  },
  FINANCE: {
    inventory: ['view'],
    deals: ['view'],
    suppliers: ['view', 'create', 'update'],
    expenses: ['view', 'create', 'update', 'delete'],
    invoices: ['view', 'create', 'update'],
    reports: ['view'],
  },
  SUPPORT: {
    inventory: ['view'],
    leads: ['view', 'create', 'update'],
    deals: ['view'],
  },
  VIEWER: {
    inventory: ['view'],
    leads: ['view'],
    deals: ['view'],
    reports: ['view'],
  },
};

export function hasPermission(role: Role, resource: Resource, action: Action): boolean {
  return permissions[role]?.[resource]?.includes(action) ?? false;
}

export function getResourcePermissions(role: Role, resource: Resource): Action[] {
  return permissions[role]?.[resource] ?? [];
}

export function getAccessibleResources(role: Role): Resource[] {
  const rolePerms = permissions[role];
  if (!rolePerms) return [];
  return Object.keys(rolePerms) as Resource[];
}

export function isSuperAdmin(role: Role): boolean {
  return role === 'SUPER_ADMIN';
}

/**
 * Build a location filter clause for Prisma queries.
 * SUPER_ADMIN sees all, others are scoped to their locationIds.
 */
export function locationFilter(role: Role, locationIds: string[]) {
  if (isSuperAdmin(role)) return {};
  return { locationId: { in: locationIds } };
}

/**
 * Check whether a user can access a specific location.
 */
export function canAccessLocation(role: Role, locationIds: string[], targetLocationId: string): boolean {
  if (isSuperAdmin(role)) return true;
  return locationIds.includes(targetLocationId);
}
