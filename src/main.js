// src/main.js
import { initRouter } from './router/router.js';
import { initNavbar } from './modules/shared/navbar/navbarController.js';
import { initNotification } from './modules/shared/notification/notificationController.js';
import { userService } from './services/userService.js';
import { navigateOrHref } from './utils/navigation.js';

// Registrar helper global window.go para compatibilidad con cambios masivos
if (typeof window !== 'undefined' && !window.go) {
    window.go = navigateOrHref;
}

// 🔥 Inicializar navbar unificado primero
initNavbar();

// 🔥 Luego inicializar router
initRouter();

// ============================================
// 🌐 Interceptor de navegación (fallback global)
// Redirige asignaciones a location.assign/replace a navigateTo para rutas internas
// ============================================
if (typeof window !== 'undefined' && window.location) {
    try {
        const originalAssign = window.location.assign.bind(window.location);
        const originalReplace = window.location.replace.bind(window.location);

        window.location.assign = (url) => {
            try {
                if (typeof url === 'string' && url.startsWith('/') && typeof window.navigateTo === 'function') {
                    window.navigateTo(url);
                } else {
                    originalAssign(url);
                }
            } catch (e) {
                console.error('Error in custom assign:', e);
                originalAssign(url);
            }
        };

        window.location.replace = (url) => {
            try {
                if (typeof url === 'string' && url.startsWith('/') && typeof window.navigateTo === 'function') {
                    // use navigateTo but replace history entry
                    window.history.replaceState({}, '', url);
                    window.navigateTo(url);
                } else {
                    originalReplace(url);
                }
            } catch (e) {
                console.error('Error in custom replace:', e);
                originalReplace(url);
            }
        };
    } catch (e) {
        console.warn('No se pudo aplicar interceptor de navegación global:', e);
    }
}


// 🔥 Inicializar notificaciones después de autenticación
document.addEventListener('auth:changed', async () => {
    const user = userService.getCurrentUser();
    if (user) {
        await initNotification();
    }
});

// 🔥 También al cargar la página (si ya hay usuario)
document.addEventListener('DOMContentLoaded', async () => {
    const user = userService.getCurrentUser();
    if (user) {
        await initNotification();
    }
});

console.log('🚀 Snaap iniciado correctamente');