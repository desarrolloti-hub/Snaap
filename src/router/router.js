import { routes } from './routes.js';

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
        if (!isNavigating) await handleRoute();
    });

    window.navigateTo = navigateTo;
    handleRoute();
}

async function navigateTo(path) {
    if (isNavigating) return;
    isNavigating = true;
    let cleanPath = path.startsWith('/') ? path : '/' + path;
    if (cleanPath !== '/' && cleanPath.endsWith('/')) {
        cleanPath = cleanPath.slice(0, -1);
    }
    window.history.pushState({}, '', cleanPath);
    await handleRoute();
    isNavigating = false;
}

async function handleRoute() {
    let path = window.location.pathname;
    console.log('📍 Navegando a:', path);

    document.dispatchEvent(new CustomEvent('route:changing', { detail: { path } }));

    // 🔥 Lo importante: si la ruta no existe en routes, usa '/404'
    let route = routes[path];
    if (!route) {
        console.warn(`⚠️ Ruta no encontrada: ${path}, redirigiendo a 404`);
        route = routes['/404'];
        // Cambiar la URL a /404 sin recargar (para que coincida)
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
            appContainer.innerHTML = `<div style="text-align:center; padding:100px;"><h1>Error</h1><p>${error.message}</p><a href="/" data-link>Volver al inicio</a></div>`;
        }
    }

    document.dispatchEvent(new CustomEvent('route:changed', { detail: { path } }));
}