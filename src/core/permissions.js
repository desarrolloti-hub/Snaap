// src/core/permissions.js
import { userService } from '../services/userService.js';

// 🔐 Configuración de permisos por ruta
export const routePermissions = {
    // ============================================
    // 🏠 RUTAS PÚBLICAS (Cualquiera puede ver)
    // ============================================
    '/': { roles: ['user', 'host', 'sysadmin'], auth: false },
    '/nosotros': { roles: ['user', 'host', 'sysadmin'], auth: false },
    '/paquetes': { roles: ['user', 'host', 'sysadmin'], auth: false },
    '/terms': { roles: ['user', 'host', 'sysadmin'], auth: false },
    '/login': { roles: ['user', 'host', 'sysadmin'], auth: false, guest: true },
    '/register': { roles: ['user', 'host', 'sysadmin'], auth: false, guest: true },

    // ============================================
    // 👤 RUTAS DE USUARIO (USER)
    // ============================================
    '/dashboard': { roles: ['user'], auth: true },

    // ============================================
    // 🎤 RUTAS DE HOST
    // ============================================
    '/host': { roles: ['host', 'sysadmin'], auth: true },
    '/host/create-event': { roles: ['host', 'sysadmin'], auth: true },
    '/host/events': { roles: ['host', 'sysadmin'], auth: true },
    '/host/event-crud': { roles: ['host', 'sysadmin'], auth: true },
    '/host/event-edit': { roles: ['host', 'sysadmin'], auth: true },
    '/host/event-details': { roles: ['host', 'sysadmin'], auth: true },
    '/host/profile': { roles: ['host', 'sysadmin'], auth: true },
    '/host/profile/edit': { roles: ['host', 'sysadmin'], auth: true },

    // ============================================
    // RUTAS DE ADMIN (SYSADMIN)
    // ============================================
    '/sysadmin/home': { roles: ['sysadmin'], auth: true },
    '/sysadmin/hosts': { roles: ['sysadmin'], auth: true },
    '/sysadmin/hosts/create': { roles: ['sysadmin'], auth: true },
    '/sysadmin/hosts/edit': { roles: ['sysadmin'], auth: true },
    '/sysadmin/admins': { roles: ['sysadmin'], auth: true },
    '/sysadmin/admins/create': { roles: ['sysadmin'], auth: true },
    '/sysadmin/admins/edit': { roles: ['sysadmin'], auth: true },
    '/sysadmin/profile': { roles: ['sysadmin'], auth: true },
    '/sysadmin/profile/edit': { roles: ['sysadmin'], auth: true },

    // ============================================
    // ERROR
    // ============================================
    '/404': { roles: ['user', 'host', 'sysadmin'], auth: false },
};

/**
 * Verifica si el usuario tiene permisos para acceder a una ruta
 */
export function hasPermission(role, path) {
    // Si no hay configuración para la ruta, permitir
    if (!routePermissions[path]) {
        return true;
    }

    const permission = routePermissions[path];
    
    // Si la ruta es pública y no requiere autenticación
    if (!permission.auth) {
        return true;
    }

    // Si requiere autenticación y no hay usuario
    if (!role) {
        return false;
    }

    // Verificar si el rol está en la lista de permitidos
    return permission.roles.includes(role);
}

/**
 * Obtiene el rol del usuario actual
 */
export function getCurrentUserRole() {
    const user = userService.getCurrentUser();
    return user ? user.role : null;
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated() {
    return userService.isAuthenticated();
}

/**
 * Obtiene la ruta de redirección según el rol
 */
export function getRedirectPathByRole(role) {
    const routes = {
        'sysadmin': '/sysadmin/home',
        'host': '/host',
        'user': '/'
    };
    return routes[role] || '/';
}

/**
 * Verifica si la ruta es pública (no requiere autenticación)
 */
export function isPublicRoute(path) {
    const permission = routePermissions[path];
    return permission ? !permission.auth : true;
}

/**
 * Verifica si la ruta es de invitado (solo para no autenticados)
 */
export function isGuestRoute(path) {
    const permission = routePermissions[path];
    return permission ? permission.guest || false : false;
}