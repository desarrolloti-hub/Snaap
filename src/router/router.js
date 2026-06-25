// src/router/router.js
import { routes } from './routes.js';
import { authGuard } from '../core/authGuard.js';
import { getCurrentUserRole, getRedirectPathByRole } from '../core/permissions.js';
import { userService } from '../services/userService.js';

let isNavigating = false;

export function initRouter() {
    // 🔥 Escuchar eventos de navegación
    document.addEventListener('click', async (e) => {
        const link = e.target.closest('[data-link]');
        if (link && !isNavigating) {
            e.preventDefault();
            e.stopPropagation();
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#')) {
                await navigateTo(href);
            }
        }
    });

    window.addEventListener('popstate', async () => {
        if (!isNavigating) {
            const path = window.location.pathname;
            await handleRoute(path, true); // true = es navegación por popstate
        }
    });

    window.navigateTo = navigateTo;
    
    // 🔥 Inicializar con la ruta actual
    const currentPath = window.location.pathname;
    handleRoute(currentPath);
}

async function navigateTo(path) {
    if (isNavigating) return;
    isNavigating = true;
    
    let cleanPath = path.startsWith('/') ? path : '/' + path;
    if (cleanPath !== '/' && cleanPath.endsWith('/')) {
        cleanPath = cleanPath.slice(0, -1);
    }
    
    window.history.pushState({}, '', cleanPath);
    await handleRoute(cleanPath);
    isNavigating = false;
}

async function handleRoute(path, isPopState = false) {
    console.log(`📍 Navegando a: ${path}`);

    // 🔥 1. VERIFICAR AUTENTICACIÓN Y PERMISOS
    const canAccess = await authGuard(path, (redirectPath) => {
        // Si no tiene permisos, redirigir
        if (!isPopState) {
            window.history.pushState({}, '', redirectPath);
            handleRoute(redirectPath);
        } else {
            window.location.href = redirectPath;
        }
    });

    // Si no puede acceder, no continuar (ya se redirigió)
    if (!canAccess) {
        return;
    }

    // 🔥 2. ACTUALIZAR NAVBAR SEGÚN ROL
    updateNavbar();

    // 🔥 3. CARGAR LA VISTA
    document.dispatchEvent(new CustomEvent('route:changing', { detail: { path } }));

    let route = routes[path];
    if (!route) {
        console.warn(`⚠️ Ruta no encontrada: ${path}, redirigiendo a 404`);
        route = routes['/404'];
        if (path !== '/404') {
            window.history.pushState({}, '', '/404');
            path = '/404';
        }
    }

    try {
        if (route.view) {
            const response = await fetch(route.view);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const html = await response.text();
            const appContainer = document.getElementById('app');
            if (appContainer) appContainer.innerHTML = html;
        } else {
            const appContainer = document.getElementById('app');
            if (appContainer) appContainer.innerHTML = '';
        }

        if (route.controller && typeof route.controller === 'function') {
            await route.controller();
        }

        window.scrollTo(0, 0);
        console.log(`✅ Vista cargada: ${path}`);
    } catch (error) {
        console.error('❌ Error cargando ruta:', error);
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = `
                <div style="text-align:center; padding:100px; background:#0a0a14; color:white; min-height:100vh;">
                    <h1 style="color:#ff007a;">⚠️ Error</h1>
                    <p style="color:#999;">${error.message}</p>
                    <a href="/" data-link style="color:#4db8ff; text-decoration:none;">← Volver al inicio</a>
                </div>
            `;
        }
    }

    document.dispatchEvent(new CustomEvent('route:changed', { detail: { path } }));
}

// ============================================
// 🔄 ACTUALIZAR NAVBAR SEGÚN ROL
// ============================================
function updateNavbar() {
    const user = userService.getCurrentUser();
    const role = user ? user.role : null;
    
    // Disparar evento para que los controladores de navbar actualicen
    document.dispatchEvent(new CustomEvent('auth:changed', { 
        detail: { 
            user: user,
            role: role,
            isAuthenticated: !!user
        } 
    }));
}

// ============================================
// 🔥 EXPONER FUNCIONES GLOBALES
// ============================================
window.navigateTo = navigateTo;
window.updateNavbar = updateNavbar;