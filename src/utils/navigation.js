// src/utils/navigation.js
/**
 * Navega a una URL usando el router SPA o redirige con href
 * @param {string} path - Ruta a navegar
 */
export function navigateOrHref(path) {
    if (typeof window === 'undefined') return;
    
    if (typeof window.navigateTo === 'function') {
        window.navigateTo(path);
    } else {
        window.location.href = path;
    }
}

/**
 * Verifica si una ruta es interna (SPA) o externa
 * @param {string} url - URL a verificar
 * @returns {boolean}
 */
export function isInternalRoute(url) {
    if (!url) return false;
    return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('http');
}

export default { navigateOrHref, isInternalRoute };