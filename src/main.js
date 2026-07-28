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

// ============================================
// 🔥 INICIALIZAR NAVBAR
// ============================================
initNavbar();

// ============================================
// 🔥 INICIALIZAR ROUTER
// ============================================
initRouter();

// ============================================
// 🌐 INTERCEPTOR DE NAVEGACIÓN (fallback global)
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

// ============================================
// 🔔 INICIALIZAR NOTIFICACIONES PUSH
// ============================================
async function initializePushNotifications(user) {
    try {
        if (!user) {
            console.log('ℹ️ No hay usuario autenticado, omitiendo notificaciones push');
            return;
        }

        console.log('🔔 Inicializando notificaciones push para usuario:', user.email);
        await initNotification();

    } catch (error) {
        console.error('❌ Error al inicializar notificaciones push:', error);
    }
}

// ============================================
// 🔔 EVENTO: CAMBIO DE AUTENTICACIÓN
// ============================================
document.addEventListener('auth:changed', async (event) => {
    const detail = event.detail || {};
    const user = detail.user || userService.getCurrentUser();
    
    console.log('🔄 Auth changed event:', { 
        isAuthenticated: !!user, 
        user: user?.email || 'No user',
        role: user?.role || 'No role'
    });

    if (user) {
        await initializePushNotifications(user);
    }
});

// ============================================
// 🔔 EVENTO: DOM CARGADO
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM cargado, verificando usuario...');
    
    const user = userService.getCurrentUser();
    if (user) {
        console.log('👤 Usuario encontrado al cargar la página:', user.email);
        await initializePushNotifications(user);
    } else {
        console.log('ℹ️ No hay usuario autenticado al cargar la página');
    }
});

// ============================================
// 🔔 EVENTO: TOGGLE MANUAL DE NOTIFICACIONES
// ============================================
document.addEventListener('click', async (e) => {
    const toggleBtn = e.target.closest('#notificationToggleBtn');
    if (!toggleBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const { toggleSubscription } = await import('./modules/shared/notification/notificationController.js');
    await toggleSubscription();
});

console.log('🚀 Snaap iniciado correctamente');