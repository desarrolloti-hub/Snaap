// src/router/router.js
import { routes } from './routes.js';
import { authGuard } from '../core/authGuard.js';
import { getCurrentUserRole, getRedirectPathByRole } from '../core/permissions.js';
import { userService } from '../services/userService.js';

let isNavigating = false;

export function initRouter() {
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
            await handleRoute(path, true);
        }
    });

    window.navigateTo = navigateTo;
    
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
    
    // Si ya estamos en la misma ruta no empujar otra entrada al historial (evita loops)
    if (cleanPath === window.location.pathname) {
        await handleRoute(cleanPath);
        isNavigating = false;
        return;
    }

    window.history.pushState({}, '', cleanPath);
    await handleRoute(cleanPath);
    isNavigating = false;
}

async function handleRoute(path, isPopState = false) {
    // ðŸ”¥ ELIMINAR PARÃMETROS DE CONSULTA PARA LA BÃšSQUEDA DE RUTA
    const pathWithoutParams = path.split('?')[0];
    console.log(`ðŸ“ Navegando a: ${path} (ruta base: ${pathWithoutParams})`);

    // ðŸ”¥ 1. VERIFICAR AUTENTICACIÃ“N Y PERMISOS (usando la ruta sin parÃ¡metros)
    const canAccess = await authGuard(pathWithoutParams, (redirectPath) => {
        // Normalizar y evitar redirigir a la misma ruta (rompe bucles de redirect)
        let target = redirectPath && redirectPath.startsWith('/') ? redirectPath : ('/' + (redirectPath || ''));
        if (target !== '/' && target.endsWith('/')) target = target.slice(0, -1);
        if (target === pathWithoutParams) {
            console.warn(`âš ï¸ Ignorando redirect a la misma ruta: ${target}`);
            return;
        }

        if (!isPopState) {
            window.history.pushState({}, '', target);
            handleRoute(target);
        } else {
            window.go(target);
        }
    });

    if (!canAccess) {
        return;
    }

    // ðŸ”¥ 2. ACTUALIZAR NAVBAR
    updateNavbar();

    // ðŸ”¥ 3. BUSCAR RUTA SIN PARÃMETROS
    let route = routes[pathWithoutParams];
    
    if (!route) {
        // Buscar con comodines
        for (const [routePath, routeConfig] of Object.entries(routes)) {
            if (routePath.includes('*') && pathWithoutParams.startsWith(routePath.replace('*', ''))) {
                route = routeConfig;
                break;
            }
        }
    }
    
    if (!route) {
        console.warn(`âš ï¸ Ruta no encontrada: ${pathWithoutParams}, redirigiendo a 404`);
        route = routes['/404'];
        if (pathWithoutParams !== '/404') {
            window.history.pushState({}, '', '/404');
            path = '/404';
        }
    }

    // ðŸ”¥ 4. CARGAR LA VISTA
    document.dispatchEvent(new CustomEvent('route:changing', { detail: { path } }));

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
        console.log(`âœ… Vista cargada: ${path}`);
    } catch (error) {
        console.error('âŒ Error cargando ruta:', error);
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = `
                <div style="text-align:center; padding:100px; background:#0a0a14; color:white; min-height:100vh;">
                    <h1 style="color:#ff007a;">âš ï¸ Error</h1>
                    <p style="color:#999;">${error.message}</p>
                    <a href="/" data-link style="color:#4db8ff; text-decoration:none;">â† Volver al inicio</a>
                </div>
            `;
        }
    }

    document.dispatchEvent(new CustomEvent('route:changed', { detail: { path } }));
}

function updateNavbar() {
    const user = userService.getCurrentUser();
    const role = user ? user.role : null;
    
    document.dispatchEvent(new CustomEvent('auth:changed', { 
        detail: { 
            user: user,
            role: role,
            isAuthenticated: !!user
        } 
    }));
}

window.navigateTo = navigateTo;
window.updateNavbar = updateNavbar;
