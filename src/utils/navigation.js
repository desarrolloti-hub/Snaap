// src/utils/navigation.js
// Helper para redirecciones internas: usa navigateTo (SPA) si estÃ¡ disponible, si no usa window.location.href
export function navigateOrHref(path) {
    try {
        if (!path) return;
        // Normalizar
        let target = path;
        if (typeof target === 'string') {
            // leave as is
        }
        if (typeof window !== 'undefined' && typeof window.navigateTo === 'function') {
            window.navigateTo(target);
        } else if (typeof window !== 'undefined') {
            window.go(target);
        }
    } catch (error) {
        console.error('navigateOrHref error:', error);
        if (typeof window !== 'undefined') window.go(path);
    }
}

