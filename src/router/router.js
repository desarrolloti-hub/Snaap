// src/router/router.js
import { routes } from './routes.js';
import { authGuard } from '../core/authGuard.js';
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
    const pathWithoutParams = path.split('?')[0];
    console.log(`📍 Navegando a: ${path}`);

    const canAccess = await authGuard(pathWithoutParams, (redirectPath) => {
        let target = redirectPath && redirectPath.startsWith('/') ? redirectPath : ('/' + (redirectPath || ''));
        if (target !== '/' && target.endsWith('/')) target = target.slice(0, -1);
        if (target === pathWithoutParams) {
            console.warn(`⚠️ Ignorando redirect a la misma ruta: ${target}`);
            return;
        }

        if (!isPopState) {
            window.history.pushState({}, '', target);
            handleRoute(target);
        } else {
            window.location.href = target;
        }
    });

    if (!canAccess) return;

    updateNavbar();

    let route = routes[pathWithoutParams];
    
    if (!route) {
        for (const [routePath, routeConfig] of Object.entries(routes)) {
            if (routePath.includes('*') && pathWithoutParams.startsWith(routePath.replace('*', ''))) {
                route = routeConfig;
                break;
            }
        }
    }
    
    if (!route) {
        console.warn(`⚠️ Ruta no encontrada: ${pathWithoutParams}`);
        route = routes['/404'];
        if (pathWithoutParams !== '/404') {
            window.history.pushState({}, '', '/404');
            path = '/404';
        }
    }

    document.dispatchEvent(new CustomEvent('route:changing', { detail: { path } }));

    try {
        const appContainer = document.getElementById('app');
        if (!appContainer) {
            console.error('❌ No se encontró #app');
            return;
        }

        if (route.view) {
            try {
                const response = await fetch(route.view);
                if (!response.ok) {
                    appContainer.innerHTML = getDefaultContent(path);
                } else {
                    const html = await response.text();
                    appContainer.innerHTML = html;
                }
            } catch (fetchError) {
                console.warn(`⚠️ Error al cargar ${route.view}:`, fetchError.message);
                appContainer.innerHTML = getDefaultContent(path);
            }
        } else {
            appContainer.innerHTML = '';
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
            appContainer.innerHTML = getErrorContent();
        }
    }

    document.dispatchEvent(new CustomEvent('route:changed', { detail: { path } }));
}

function getDefaultContent(path) {
    const name = path === '/' ? 'Inicio' : path.replace('/', '').charAt(0).toUpperCase() + path.slice(2);
    return `
        <div style="text-align:center; padding:80px 20px; background:#0a0a14; color:white; min-height:70vh;">
            <h1 style="color:#4db8ff; font-size:3rem;">${name}</h1>
            <p style="color:#999; margin:20px 0;">Bienvenido a SNAAP</p>
            <a href="/" data-link style="color:#4db8ff; text-decoration:none; border:1px solid #4db8ff; padding:10px 20px; border-radius:50px; display:inline-block; margin-top:20px;">
                ← Volver al inicio
            </a>
        </div>
    `;
}

function getErrorContent() {
    return `
        <div style="text-align:center; padding:100px 20px; background:#0a0a14; color:white; min-height:70vh;">
            <h1 style="color:#ff007a;">⚠️ Error</h1>
            <p style="color:#999;">No se pudo cargar la página</p>
            <a href="/" data-link style="color:#4db8ff; text-decoration:none; border:1px solid #4db8ff; padding:10px 20px; border-radius:50px; display:inline-block; margin-top:20px;">
                ← Volver al inicio
            </a>
        </div>
    `;
}

function updateNavbar() {
    const user = userService.getCurrentUser();
    document.dispatchEvent(new CustomEvent('auth:changed', { 
        detail: { 
            user: user,
            role: user?.role || null,
            isAuthenticated: !!user
        } 
    }));
}

window.navigateTo = navigateTo;
window.updateNavbar = updateNavbar;