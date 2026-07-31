export const SUPERADMIN_ROLE = 'SUPERADMINISTRADOR';

export const normalizeRole = value => String(value?.rol ?? value?.nombre_rol ?? value ?? '').trim().toUpperCase();

export const isSuperAdmin = value => normalizeRole(value) === SUPERADMIN_ROLE;

export const canAccess = (value, allowedRoles = []) => (
    isSuperAdmin(value) || allowedRoles.map(normalizeRole).includes(normalizeRole(value))
);
