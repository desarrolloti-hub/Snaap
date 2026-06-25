// src/core/authGuard.js
import { userService } from '../services/userService.js';
import { 
    hasPermission, 
    getCurrentUserRole, 
    isAuthenticated, 
    getRedirectPathByRole,
    isPublicRoute,
    isGuestRoute
} from './permissions.js';

/**
 * Guardia de autenticación - Verifica si el usuario puede acceder a una ruta
 * @param {string} path - Ruta a verificar
 * @param {Function} redirect - Función de redirección
 * @returns {boolean} - true si puede acceder, false si debe redirigir
 */
export async function authGuard(path, redirect) {
    const user = userService.getCurrentUser();
    const role = user ? user.role : null;
    const isAuth = isAuthenticated();

    console.log(`🔐 AuthGuard: ${path} | Autenticado: ${isAuth} | Rol: ${role}`);

    // ============================================
    // 1. RUTAS DE INVITADO (login, register)
    // ============================================
    if (isGuestRoute(path)) {
        if (isAuth) {
            // Si está autenticado y quiere ir a login/register, redirigir a su dashboard
            console.log(`🔄 Usuario autenticado en ruta de invitado, redirigiendo...`);
            const redirectPath = getRedirectPathByRole(role);
            redirect(redirectPath);
            return false;
        }
        return true; // Permitir acceso a invitados
    }

    // ============================================
    // 2. RUTAS PÚBLICAS
    // ============================================
    if (isPublicRoute(path)) {
        return true; // Permitir acceso a todos
    }

    // ============================================
    // 3. RUTAS PROTEGIDAS (requieren autenticación)
    // ============================================
    if (!isAuth) {
        console.log(`🔒 Ruta protegida sin autenticación, redirigiendo a login`);
        redirect('/login');
        return false;
    }

    // ============================================
    // 4. VERIFICAR PERMISOS POR ROL
    // ============================================
    if (!hasPermission(role, path)) {
        console.log(`🚫 Usuario ${role} sin permisos para ${path}`);
        const redirectPath = getRedirectPathByRole(role);
        redirect(redirectPath);
        return false;
    }

    // ============================================
    // 5. TODO OK - PERMITIR ACCESO
    // ============================================
    console.log(`✅ Acceso permitido a ${path} para rol ${role}`);
    return true;
}