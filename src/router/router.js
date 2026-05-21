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
    window.history.pushState({}, '', path);
    await handleRoute();
    isNavigating = false;
}

async function handleRoute() {
    const path = window.location.pathname;
    document.dispatchEvent(new CustomEvent('route:changing', { detail: { path } }));
    
    let route = routes[path];
    if (!route) route = routes['/404'] || routes['/'];
    
    try {
        const response = await fetch(route.view);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        const appContainer = document.getElementById('app');
        if (appContainer) appContainer.innerHTML = html;
        if (route.controller && typeof route.controller === 'function') await route.controller();
        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Error cargando ruta:', error);
        const appContainer = document.getElementById('app');
        if (appContainer) appContainer.innerHTML = `<h1>Error cargando página</h1><p>${error.message}</p>`;
    }
    document.dispatchEvent(new CustomEvent('route:changed', { detail: { path } }));
}